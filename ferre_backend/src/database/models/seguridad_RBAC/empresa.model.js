module.exports = (sequelize, DataTypes) => {
  const Empresa = sequelize.define('Empresa', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: { type: DataTypes.STRING, allowNull: false },
    direccion: DataTypes.STRING,
    telefono: DataTypes.STRING,
    correo: DataTypes.STRING,
    nit: DataTypes.STRING,
    estado : { type: DataTypes.BOOLEAN, allowNull: true }

  }, { tableName: 'Empresas', timestamps: true });

  Empresa.associate = function(models) {
    Empresa.hasMany(models.Usuario, { foreignKey: 'empresa_id' }); 
    Empresa.hasOne(models.ConfiguracionEmpresa, { foreignKey: 'empresa_id', as: 'configuracion', onDelete: 'CASCADE' });
  };

  return Empresa;
};
