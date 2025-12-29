// src/database/models/financiero/detalleCompra.model.js
module.exports = (sequelize, DataTypes) => {
  const DetalleCompra = sequelize.define('DetalleCompra', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    compra_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  }, {
    tableName: 'DetallesCompras',
    timestamps: true,
  });

  DetalleCompra.associate = (models) => {
    DetalleCompra.belongsTo(models.Compra, { foreignKey: 'compra_id' });
    DetalleCompra.belongsTo(models.Producto, { foreignKey: 'producto_id' });
  };

  return DetalleCompra;
};
