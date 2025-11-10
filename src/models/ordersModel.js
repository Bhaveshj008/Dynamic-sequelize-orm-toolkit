const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Orders = sequelize.define('Orders', {
    order_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: { type: DataTypes.UUID },
    order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    order_status: { type: DataTypes.STRING(30), defaultValue: 'placed' },
  }, { tableName: 'orders', timestamps: false, underscored: true });
  return Orders;
};
