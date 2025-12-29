module.exports = (sequelize, DataTypes) => {
  const RolPermiso = sequelize.define('RolPermiso', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }, 
    permiso_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, { 
    tableName: 'RolPermiso', 
    timestamps: true 
  });

  RolPermiso.associate = function(models) {
    RolPermiso.belongsTo(models.Rol, { foreignKey: 'rol_id' });
    RolPermiso.belongsTo(models.Permiso, { foreignKey: 'permiso_id' });
  };

  return RolPermiso;
};
