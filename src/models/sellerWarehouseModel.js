const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const SellerWarehouse = sequelize.define('SellerWarehouse', {
    warehouse_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    seller_id: { type: DataTypes.UUID, allowNull: false },
    registered_name: { type: DataTypes.TEXT },
    address: { type: DataTypes.TEXT }, city: { type: DataTypes.TEXT }, state: { type: DataTypes.TEXT },
    pin_code: { type: DataTypes.TEXT }, country: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'seller_warehouses', timestamps: false, underscored: true });
  return SellerWarehouse;
};
