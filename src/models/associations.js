// /**
//  * Lazy-loading Sequelize model initializer with optional per-model associations.
//  *
//  * - Models are loaded only when accessed via Proxy.
//  * - Associations are queued and only wired when both models are initialized.
//  * - This supports large-scale, optimized ORM usage with minimal memory and overhead.
//  */

const modelDefinitions = {
  Products: require("./productsModel"),
  ProductVariants: require("./productVariantsModel"),
  ProductImages: require("./productImagesModel"),
  ProductAttributes: require("./productAttributesModel"),
  ProductBulletPoints: require("./productBulletPointsModel"),
  ProductReviews: require("./productReviewsModel"),
  ProductCategories: require("./productCategoriesModel"),
  SellerInfo: require("./sellerInfoModel"), // Cross-DB
  Bug: require("./bugsModel"),
  ProductReturnPolicy: require("./productReturnPolicies"),
  ReturnPolicyGuideline: require("./returnPolicyGuidelines"),
  SellerAddress: require("./seller_address"),
  SellerWarehouse: require("./sellerWarehouseModel"),
  ReturnReason: require("./returnReason")
};
/**
 * Association queue that holds wiring logic.
 * Functions inside are retried after each model init to ensure both ends are ready.
 */
const associationQueue = [];

/**
 * Define associations per model. These are *not executed immediately*.
 * Instead, each function pushes wiring logic into `associationQueue`.
 */
const associationsMap = {};


/**
 * Sequelize model loader that returns a Proxy for on-demand model access.
 *
 * @param {Sequelize} sequelize - The Sequelize instance for the DB connection
 * @returns {Proxy} Proxy object exposing initialized models on access
 */
module.exports = (sequelize) => {
  const initializedModels = {};

  /**
   * Initializes and caches a model if not already loaded.
   * Also triggers association queue after every load.
   *
   * @param {string} name - Name of the model to load
   * @returns {Model} Sequelize model instance
   */
  const getModel = (name) => {
    if (!initializedModels[name]) {
      const def = modelDefinitions[name];
      if (!def) throw new Error(`❌ Model "${name}" not found`);

      console.log(`🟢 [Sequelize] Initializing model: ${name}`);
      initializedModels[name] = def(sequelize);

      // Queue associations for this model (if any)
      if (typeof associationsMap[name] === "function") {
        console.log(`🔗 [Associations] Queuing associations for: ${name}`);
        associationsMap[name](initializedModels);
      }

      // Re-run all queued associations to wire if both ends are ready
      associationQueue.forEach((fn, i) => {
        try {
          fn(); // No-op if both models not ready
        } catch (err) {
          console.warn(
            `⚠️ Association wiring attempt ${i} failed: ${err.message}`
          );
        }
      });
    } else {
      console.log(`🟡 [Cache] Using cached model: ${name}`);
    }

    return initializedModels[name];
  };

  // Return proxy to lazily load models
  return new Proxy(
    { sequelize },
    {
      get(_, prop) {
        if (prop === "sequelize") return sequelize;
        return getModel(prop);
      },
    }
  );
};

