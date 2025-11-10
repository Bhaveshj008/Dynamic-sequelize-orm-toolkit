const { DataTypes } = require('sequelize');
const { databases } = require('@config/dbMap.json');

module.exports = (sequelize) => {
  const table = databases.PRODUCT.tables.PRODUCTS;
  const Product = sequelize.define('Product', {
    product_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    parent_category_id: { type: DataTypes.UUID, allowNull: false },
    sub_category_id: { type: DataTypes.UUID, allowNull: false },
    seller_id: { type: DataTypes.UUID, allowNull: false },
    product_name: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT },
    primary_image: { type: DataTypes.TEXT },
    is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_returnable: { type: DataTypes.BOOLEAN, defaultValue: false },
    approval_status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
    status: { type: DataTypes.STRING(50), defaultValue: 'inactive' },
    gst: { type: DataTypes.DECIMAL, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: table, timestamps: false, underscored: true });
  return Product;
};
