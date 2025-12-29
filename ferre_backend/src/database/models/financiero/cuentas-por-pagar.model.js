// src/database/models/finanzas/cuenta-por-pagar.model.js
module.exports = (sequelize, DataTypes) => {
  const CuentaPorPagar = sequelize.define('CuentaPorPagar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    compra_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    proveedor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: false
    },

    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    saldo_pendiente: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA', 'ANULADA'),
      allowNull: false,
      defaultValue: 'PENDIENTE'
    }
  }, {
    tableName: 'CuentasPorPagar',
    timestamps: true
  });

  CuentaPorPagar.associate = (models) => {
    CuentaPorPagar.belongsTo(models.Compra,    { foreignKey: 'compra_id',    as: 'compra' });
    CuentaPorPagar.belongsTo(models.Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
    CuentaPorPagar.belongsTo(models.Empresa,   { foreignKey: 'empresa_id',   as: 'empresa' });

    CuentaPorPagar.hasMany(models.PagoDetalle, { foreignKey: 'cxp_id', as: 'pagos_aplicados' });
  };

  return CuentaPorPagar;
};
