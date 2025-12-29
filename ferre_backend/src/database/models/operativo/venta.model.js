// src/database/models/operativo/venta.model.js
module.exports = (sequelize, DataTypes) => {
  const Venta = sequelize.define('Venta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    observacion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    tipo_venta: {
      type: DataTypes.ENUM('CONTADO', 'CREDITO'),
      allowNull: false,
      defaultValue: 'CONTADO'
    },
    numero_factura: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Ventas',
    timestamps: true
  });

  Venta.associate = (models) => {
    Venta.belongsTo(models.Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
    Venta.belongsTo(models.Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
    Venta.hasMany(models.DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });

    Venta.hasOne(models.CuentaPorCobrar, { foreignKey: 'venta_id', as: 'cuenta_por_cobrar', onDelete: 'CASCADE' });
  };

  return Venta;
};
