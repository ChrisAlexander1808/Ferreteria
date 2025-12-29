module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Empresas",
      key: "id"
    },
    onDelete: "CASCADE"
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING
  },
  telefono: {
    type: DataTypes.STRING
  },
  correo: {
    type: DataTypes.STRING,
    validate: {
      isEmail: { msg: "Debe ser un correo válido" }
    }
  },
  nit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_cliente: {
    type: DataTypes.ENUM("Normal", "Individual", "Corporativo"),
    defaultValue: "Normal"
  },
  limite_credito: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
  }, { tableName: 'Clientes', timestamps: true });

  Cliente.associate = function(models) {
    Cliente.belongsTo(models.Empresa, { foreignKey: 'empresa_id' });
  };

  return Cliente;
};
