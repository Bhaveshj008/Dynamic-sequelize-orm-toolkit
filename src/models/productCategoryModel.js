const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const ProductCategory = sequelize.define('ProductCategory', {
    category_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    category_name: { type: DataTypes.TEXT, allowNull: false },
  }, { tableName: 'product_categories', timestamps: false, underscored: true });
  return ProductCategory;
};
