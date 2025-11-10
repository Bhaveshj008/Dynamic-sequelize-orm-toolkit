const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const ProductImage = sequelize.define('ProductImage', {
    image_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    variant_id: { type: DataTypes.UUID, allowNull: false },
    image_url: { type: DataTypes.TEXT, allowNull: false },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
    uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'product_images', timestamps: false, underscored: true });
  return ProductImage;
};
