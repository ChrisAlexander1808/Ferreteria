module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    } 
  });

  Rol.associate = function(models) {
    Rol.hasMany(models.Usuario, { foreignKey: 'rol_id' });
    Rol.belongsToMany(models.Permiso, { through: models.RolPermiso, foreignKey: 'rol_id' });
  };

  return Rol;
};
