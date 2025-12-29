// src/models/movimiento-inventario.model.js
module.exports = (sequelize, DataTypes) => {
  const MovimientoInventario = sequelize.define('MovimientoInventario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: DataTypes.ENUM('ENTRADA', 'SALIDA', 'AJUSTE'),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    motivo: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    referencia: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'MovimientosInventarios',
    timestamps: true
  });

  MovimientoInventario.associate = (models) => {
    MovimientoInventario.belongsTo(models.Producto, { foreignKey: 'producto_id', as: 'producto' });
  };

  return MovimientoInventario;
};
