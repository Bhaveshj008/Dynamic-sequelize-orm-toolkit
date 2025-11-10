const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const ProductAttribute = sequelize.define('ProductAttribute', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    variant_id: { type: DataTypes.UUID, allowNull: false },
    attribute_name: { type: DataTypes.TEXT, allowNull: false },
    attribute_value: { type: DataTypes.TEXT, allowNull: false },
  }, { tableName: 'product_attributes', timestamps: false, underscored: true });
  return ProductAttribute;
};
