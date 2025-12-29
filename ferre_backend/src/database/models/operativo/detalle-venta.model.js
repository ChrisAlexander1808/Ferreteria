// src/database/models/operativo/detalle-venta.model.js
module.exports = (sequelize, DataTypes) => {
  const DetalleVenta = sequelize.define('DetalleVenta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    venta_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo_item: {
      type: DataTypes.ENUM('BIEN', 'SERVICIO'),
      allowNull: false
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'DetallesVentas',
    timestamps: true
  });

  DetalleVenta.associate = (models) => {
    DetalleVenta.belongsTo(models.Venta, { foreignKey: 'venta_id', as: 'venta' });
    DetalleVenta.belongsTo(models.Producto, { foreignKey: 'producto_id', as: 'producto' });
  };

  return DetalleVenta;
};
