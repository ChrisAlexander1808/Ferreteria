module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    nombre: DataTypes.STRING,
    correo: { type: DataTypes.STRING, allowNull: false, unique: true },
    contrasena: { type: DataTypes.STRING, allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'Usuarios', timestamps: true });

  Usuario.associate = function(models) {
    Usuario.belongsTo(models.Rol, { foreignKey: 'rol_id' });
    Usuario.belongsTo(models.Empresa, { foreignKey: 'empresa_id' });
    Usuario.hasMany(models.UsuarioModulo, { foreignKey: 'usuario_id' }); 
    Usuario.hasMany(models.BitacoraAcceso, { foreignKey: 'usuario_id' });
    Usuario.hasMany(models.Auditoria, { foreignKey: 'usuario_id' });
    
  };

  return Usuario;
};
