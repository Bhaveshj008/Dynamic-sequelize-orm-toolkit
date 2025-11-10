const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const OrderSellerItem = sequelize.define('OrderSellerItem', {
    item_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    order_id: { type: DataTypes.UUID, allowNull: false },
    seller_id: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.STRING(30), defaultValue: 'placed' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'order_seller_items', timestamps: false, underscored: true });
  return OrderSellerItem;
};
