module.exports = (sequelize, DataTypes) => {
  const Permiso = sequelize.define('Permiso', {
    clave: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    descripcion: DataTypes.STRING,
    modulo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, { tableName: 'Permisos' });

  Permiso.associate = function(models) {
    Permiso.belongsTo(models.Modulo, { foreignKey: 'modulo_id' });
    Permiso.belongsToMany(models.Rol, { through: models.RolPermiso, foreignKey: 'permiso_id' });
  };

  return Permiso;
};
