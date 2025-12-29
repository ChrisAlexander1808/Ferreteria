// src/database/models/finanzas/cuenta-por-cobrar.model.js
module.exports = (sequelize, DataTypes) => {
  const CuentaPorCobrar = sequelize.define('CuentaPorCobrar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    venta_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true
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
      type: DataTypes.ENUM('PENDIENTE', 'PARCIAL', 'PAGADA', 'ANULADA', 'VENCIDA'),
      defaultValue: 'PENDIENTE'
    }
  }, {
    tableName: 'CuentasPorCobrar',
    timestamps: true
  });

  CuentaPorCobrar.associate = (models) => {
    CuentaPorCobrar.belongsTo(models.Venta,   { foreignKey: 'venta_id',   as: 'venta' });
    CuentaPorCobrar.belongsTo(models.Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
    CuentaPorCobrar.belongsTo(models.Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

    CuentaPorCobrar.hasMany(models.PagoDetalle, { foreignKey: 'cxc_id', as: 'pagos_aplicados' });
  };

  return CuentaPorCobrar;
};
