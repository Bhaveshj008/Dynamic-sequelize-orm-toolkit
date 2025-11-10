/**
 * Dynamically joins unlimited tables/models across DBs by performing batched queries,
 * supporting filtering (where), pagination (skip/limit), sorting (orderBy),
 * and both 1:1 and 1:N relationships.
 *
 * @template T
 * @param {Object} params
 * @param {Array<T>} params.primaryData - Array of primary rows (plain objects).
 * @param {Array<{
 *   foreignModel: import('sequelize').Model<any, any>, 
 *   joinKey: string,                               
 *   mapKey: string,                                
 *   as: string,                                    
 *   attributes?: string[],                         
 *   multi?: boolean,                               
 *   where?: Array<Object>,                         // Array of conditions (AND/OR supported)
 *   limit?: number,                                // Limit per join fetch
 *   skip?: number,                                 // Offset for pagination
 *   orderBy?: Array<{ field: string, direction?: 'ASC' | 'DESC' }> // Order clauses
 * }>} params.joins - Join configuration objects.
 *
 * @returns {Promise<Array<T & Record<string, any>>>} Enriched data with joined fields.
 */
const crossJoinModels = async ({ primaryData, joins }) => {
  if (!primaryData?.length) return [];

  const enrichedData = [...primaryData];

  for (const join of joins) {
    const {
      foreignModel,
      joinKey,
      mapKey,
      as,
      attributes = [],
      multi = false,
      where = [],              // <-- NEW
      limit = null,            // <-- NEW
      skip = 0,                // <-- NEW
      orderBy = [],            // <-- NEW
    } = join;

    // 1. Extract unique join values
    const joinValues = [...new Set(enrichedData.map((row) => row[mapKey]))].filter(Boolean);
    if (!joinValues.length) {
      enrichedData.forEach((row) => (row[as] = multi ? [] : null));
      continue;
    }

    // 2. Build Sequelize WHERE clause
    const baseCondition = { [joinKey]: joinValues };
    let finalWhere = baseCondition;
    if (where.length) {
      // Supports AND/OR by spreading multiple objects
      finalWhere = {
        ...baseCondition,
        ...Object.assign({}, ...where), 
      };
    }

    // 3. Build ORDER clause
    const order = orderBy.length
      ? orderBy.map((o) => [o.field, o.direction?.toUpperCase() || "ASC"])
      : [["created_at", "DESC"]]; // Default: Latest first

    // 4. Fetch foreign data in batches
    const BATCH_SIZE = 500;
    const foreignData = [];

    for (let i = 0; i < joinValues.length; i += BATCH_SIZE) {
      const batch = joinValues.slice(i, i + BATCH_SIZE);
      const result = await foreignModel.findAll({
        where: { ...finalWhere, [joinKey]: batch },
        attributes: attributes.length ? attributes : [joinKey],
        raw: true,
        order,
        ...(limit ? { limit } : {}),  // Pagination support
        ...(skip ? { offset: skip } : {}),
      });
      foreignData.push(...result);
    }

    // 5. Map foreign data (supports 1:1 or 1:N)
    const foreignMap = {};
    for (const item of foreignData) {
      const key = item[joinKey];
      if (multi) {
        if (!foreignMap[key]) foreignMap[key] = [];
        foreignMap[key].push(item);
      } else {
        foreignMap[key] = item;
      }
    }

    // 6. Attach joined results to primary rows
    enrichedData.forEach((row) => {
      row[as] = foreignMap[row[mapKey]] || (multi ? [] : null);
    });
  }

  return enrichedData;
};

module.exports = crossJoinModels;
