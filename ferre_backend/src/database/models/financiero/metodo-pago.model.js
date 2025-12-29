// src/database/models/finanzas/metodo-pago.model.js
module.exports = (sequelize, DataTypes) => {
  const MetodoPago = sequelize.define('MetodoPago', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: true
      // Si quieres que los métodos sean globales, puedes dejar esto en null
    },

    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
      // Ej: EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA, etc.
    },

    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },

    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'MetodosPago',
    timestamps: true
  });

  MetodoPago.associate = (models) => {
    MetodoPago.belongsTo(models.Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

    MetodoPago.hasMany(models.Pago, { foreignKey: 'metodo_pago_id', as: 'pagos' });
  };

  return MetodoPago;
};
