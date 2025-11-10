const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const ProductVariant = sequelize.define('ProductVariant', {
    variant_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    product_id: { type: DataTypes.UUID, allowNull: false },
    variant_name: { type: DataTypes.TEXT },
    variant_value: { type: DataTypes.TEXT },
    original_price: { type: DataTypes.DECIMAL },
    discounted_price: { type: DataTypes.DECIMAL },
    stock_quantity: { type: DataTypes.INTEGER },
    length: { type: DataTypes.DECIMAL }, width: { type: DataTypes.DECIMAL }, height: { type: DataTypes.DECIMAL },
    dimension_unit: { type: DataTypes.STRING(10) },
    net_weight: { type: DataTypes.DECIMAL }, weight_unit: { type: DataTypes.STRING(10) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'product_variants', timestamps: false, underscored: true });
  return ProductVariant;
};
