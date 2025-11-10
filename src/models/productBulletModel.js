const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const ProductBullet = sequelize.define('ProductBullet', {
    bullet_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    product_id: { type: DataTypes.UUID, allowNull: false },
    bullet_text: { type: DataTypes.TEXT, allowNull: false },
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'product_bullet_points', timestamps: false, underscored: true });
  return ProductBullet;
};
