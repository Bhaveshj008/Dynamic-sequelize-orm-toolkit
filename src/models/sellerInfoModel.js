const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const SellerInfo = sequelize.define('SellerInfo', {
    seller_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    store_name: { type: DataTypes.TEXT },
    slug: { type: DataTypes.TEXT },
    store_logo: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING(20), defaultValue: 'active' },
  }, { tableName: 'seller_info', timestamps: false, underscored: true });
  return SellerInfo;
};
