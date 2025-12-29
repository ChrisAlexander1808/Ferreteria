// src/database/models/finanzas/pago.model.js
module.exports = (sequelize, DataTypes) => {
  const Pago = sequelize.define('Pago', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // 🔹 Origen del pago: CXC (cobro a cliente) o CXP (pago a proveedor)
    origen: {
      type: DataTypes.ENUM('CXC', 'CXP', 'CC', 'CP'),
      allowNull: false
    },

    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    proveedor_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    tipo_documento: {
      type: DataTypes.ENUM('PAGO', 'NOTA_CREDITO', 'NOTA_DEBITO', 'AJUSTE'),
      allowNull: false,
      defaultValue: 'PAGO'
    },

    metodo_pago_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    referencia: {
      type: DataTypes.STRING(100),
      allowNull: true
      // Ej: No. boleta, No. transferencia, etc.
    },

    observacion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },

    estado: {
      type: DataTypes.ENUM('REGISTRADO', 'ANULADO'),
      allowNull: false,
      defaultValue: 'REGISTRADO'
    },
  }, {
    tableName: 'Pagos',
    timestamps: true
  });

  Pago.associate = (models) => {
    Pago.belongsTo(models.Empresa,   { foreignKey: 'empresa_id',   as: 'empresa' });
    Pago.belongsTo(models.Cliente,   { foreignKey: 'cliente_id',   as: 'cliente' });
    Pago.belongsTo(models.Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
    Pago.belongsTo(models.MetodoPago,{ foreignKey: 'metodo_pago_id', as: 'metodo_pago' });

    Pago.hasMany(models.PagoDetalle, { foreignKey: 'pago_id', as: 'detalles' });
  };

  return Pago;
};
