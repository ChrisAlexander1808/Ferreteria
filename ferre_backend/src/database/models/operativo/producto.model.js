module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING, 
      allowNull: true
    },
    precio_compra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    precio_venta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock_actual: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unidad_medida: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'Productos',
    timestamps: true
  });

  Producto.associate = (models) => {
    Producto.belongsTo(models.Categoria, {
      foreignKey: 'categoria_id',
      as: 'categoria'
    });

    Producto.hasMany(models.MovimientoInventario, {
      foreignKey: 'producto_id',
      as: 'movimientos'
    });
  };

  return Producto;
};
