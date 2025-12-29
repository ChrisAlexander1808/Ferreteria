module.exports = (sequelize, DataTypes) => {
  const Modulo = sequelize.define('Modulo', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: { 
      type: DataTypes.STRING, 
      allowNull: false, 
    },
    clave: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Identificador único para uso interno y permisos'
    },
    descripcion: DataTypes.STRING,
    activo: { 
      type: DataTypes.BOOLEAN, defaultValue: true 
    }
  }, { tableName: 'Modulos' });

  Modulo.associate = function(models) {
    Modulo.hasMany(models.Permiso, { foreignKey: 'modulo_id' });
    Modulo.hasMany(models.UsuarioModulo, { foreignKey: 'modulo_id' });
  };

  return Modulo;
};
