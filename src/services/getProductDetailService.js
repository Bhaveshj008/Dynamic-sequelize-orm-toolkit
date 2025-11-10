require("module-alias/register");
const { Op } = require("sequelize");
const getModels = require("@utils/getModels");
const { databases } = require("@config/dbMap.json");
const { makeDynamicInclude } = require("@utils/dynamicAssociations");
const crossJoinModels = require("@utils/crossJoinModels");

async function getProductDetailService({ product_id }) {
  const { PRODUCT, SELLER } = databases;
  const productDb = PRODUCT.DB_NAME;
  const sellerDb = SELLER.DB_NAME;

  const {
    sequelize,
    Product,
    ProductVariant,
    ProductImage,
    ProductAttribute,
    ProductBullet,
    ProductCategory,
  } = getModels(productDb);

  const { SellerInfo, SellerWarehouse } = getModels(sellerDb);

  const PRODUCT_ATTRS = [
    "product_id",
    "seller_id",
    "product_name",
    "description",
    "parent_category_id",
    "sub_category_id",
    "is_featured",
    "is_returnable",
    "status",
    "approval_status",
    "primary_image",
    "gst",
  ];

  const VARIANT_ATTRS = [
    "variant_id",
    "variant_name",
    "variant_value",
    "original_price",
    "discounted_price",
    "stock_quantity",
    "length",
    "width",
    "height",
    "dimension_unit",
    "net_weight",
    "weight_unit",
  ];

  const CATEGORY_ATTRS = ["category_id", "category_name"];
  const BULLET_ATTRS = ["bullet_id", "bullet_text", "position"];

  const includeVariantImages = makeDynamicInclude(
    sequelize,
    {
      from: ProductVariant,
      to: ProductImage,
      as: "ProductImages_Variant",
      type: "hasMany",
      foreignKey: "variant_id",
      sourceKey: "variant_id",
      constraints: false,
    },
    {
      required: false,
      separate: true,
      attributes: ["image_id", "image_url", "is_primary", "uploaded_at"],
      order: [["uploaded_at", "DESC"]],
    }
  );

  const includeVariantAttributes = makeDynamicInclude(
    sequelize,
    {
      from: ProductVariant,
      to: ProductAttribute,
      as: "ProductAttributes_Variant",
      type: "hasMany",
      foreignKey: "variant_id",
      sourceKey: "variant_id",
      constraints: false,
    },
    {
      required: false,
      separate: true,
      attributes: ["id", "attribute_name", "attribute_value"],
    }
  );

  const includeVariants = makeDynamicInclude(
    sequelize,
    {
      from: Product,
      to: ProductVariant,
      as: "ProductVariants",
      type: "hasMany",
      foreignKey: "product_id",
      sourceKey: "product_id",
      constraints: false,
    },
    {
      required: false,
      attributes: VARIANT_ATTRS,
      include: [includeVariantImages, includeVariantAttributes],
    }
  );

  const includeParentCategory = makeDynamicInclude(
    sequelize,
    {
      from: Product,
      to: ProductCategory,
      as: "ParentCategory",
      type: "belongsTo",
      foreignKey: "parent_category_id",
      targetKey: "category_id",
      constraints: false,
    },
    { attributes: CATEGORY_ATTRS }
  );

  const includeSubCategory = makeDynamicInclude(
    sequelize,
    {
      from: Product,
      to: ProductCategory,
      as: "SubCategory",
      type: "belongsTo",
      foreignKey: "sub_category_id",
      targetKey: "category_id",
      constraints: false,
    },
    { attributes: CATEGORY_ATTRS }
  );

  const includeBulletPoints = makeDynamicInclude(
    sequelize,
    {
      from: Product,
      to: ProductBullet,
      as: "ProductBulletPoints",
      type: "hasMany",
      foreignKey: "product_id",
      sourceKey: "product_id",
      constraints: false,
    },
    { required: false, attributes: BULLET_ATTRS, order: [["position", "ASC"]] }
  );

  const product = await Product.findOne({
    where: { product_id },
    attributes: PRODUCT_ATTRS,
    include: [
      includeVariants,
      includeParentCategory,
      includeSubCategory,
      includeBulletPoints,
    ],
    raw: false,
    nest: true,
  });
  if (!product) return { error: true, message: "PRODUCT_NOT_FOUND" };

  const productData = product.get({ plain: true });

  const [enriched] = await crossJoinModels({
    primaryData: [productData],
    joins: [
      {
        foreignModel: SellerInfo,
        joinKey: "seller_id",
        mapKey: "seller_id",
        as: "seller",
        attributes: ["seller_id", "store_name", "slug", "store_logo", "status"],
        where: [{ status: "active" }],
        limit: 1,
      },
      {
        foreignModel: SellerWarehouse,
        joinKey: "seller_id",
        mapKey: "seller_id",
        as: "warehouses",
        attributes: [
          "warehouse_id",
          "seller_id",
          "registered_name",
          "address",
          "city",
          "state",
          "pin_code",
          "country",
          "is_active",
          "created_at",
        ],
        where: [{ is_active: true }],
        orderBy: [{ field: "created_at", direction: "DESC" }],
        multi: true,
      },
    ],
  });

  const default_warehouse =
    Array.isArray(enriched?.warehouses) && enriched.warehouses.length > 0
      ? enriched.warehouses[0]
      : null;

  const return_policy = null; // wire real ReturnPolicy models if desired

  return { ...enriched, default_warehouse, return_policy };
}

module.exports = getProductDetailService;
