// src/database/models/finanzas/pago-detalle.model.js
module.exports = (sequelize, DataTypes) => {
  const PagoDetalle = sequelize.define('PagoDetalle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    pago_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // 🔹 Si origen = 'CXC' usamos cxc_id
    cxc_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // 🔹 Si origen = 'CXP' usamos cxp_id
    cxp_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    monto_aplicado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    observacion: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'PagosDetalles',
    timestamps: true
  });

  PagoDetalle.associate = (models) => {
    PagoDetalle.belongsTo(models.Pago, { foreignKey: 'pago_id', as: 'pago' });
    PagoDetalle.belongsTo(models.CuentaPorCobrar, { foreignKey: 'cxc_id',  as: 'cuenta_por_cobrar' });
    PagoDetalle.belongsTo(models.CuentaPorPagar,  { foreignKey: 'cxp_id',  as: 'cuenta_por_pagar' });
  };

  return PagoDetalle;
};
