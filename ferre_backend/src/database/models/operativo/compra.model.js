// src/database/models/financiero/compra.model.js
module.exports = (sequelize, DataTypes) => {
  const Compra = sequelize.define('Compra', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    proveedor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    tipo_compra: {
      type: DataTypes.ENUM('CONTADO', 'CREDITO'),
      allowNull: false,
      defaultValue: 'CONTADO'
    },
    numero_factura: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    observacion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('ACTIVA', 'ANULADA'),
      allowNull: false,
      defaultValue: 'ACTIVA'
    }
  }, {
    tableName: 'Compras',
    timestamps: true,
  });

  Compra.associate = (models) => {
    Compra.belongsTo(models.Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
    Compra.hasMany(models.DetalleCompra, { foreignKey: 'compra_id', as: 'detalles' });
    Compra.hasMany(models.GastoCompra, { foreignKey: 'compra_id', as: 'gastos' });  
    
    Compra.hasOne(models.CuentaPorPagar, { foreignKey: 'compra_id', as: 'cuenta_por_pagar' });
  };

  return Compra;
};
