// src/database/models/financiero/compraGasto.model.js
module.exports = (sequelize, DataTypes) => {
  const GastoCompra = sequelize.define('GastoCompra', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    compra_id: { type: DataTypes.INTEGER, allowNull: false },
    descripcion: { type: DataTypes.STRING, allowNull: false },
    monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  }, {
    tableName: 'ComprasGastos',  // 👈 si esa es la que ya existe en BD
    timestamps: true,
  });

  GastoCompra.associate = (models) => {
    GastoCompra.belongsTo(models.Compra, { foreignKey: 'compra_id', as: 'compra' });
  };

  return GastoCompra;
};
