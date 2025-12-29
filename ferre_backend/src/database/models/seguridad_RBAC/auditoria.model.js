module.exports = (sequelize, DataTypes) => {
  const Auditoria = sequelize.define('Auditoria', {
    tabla: DataTypes.STRING,
    accion: DataTypes.STRING,
    datos_anteriores: DataTypes.JSON,
    datos_nuevos: DataTypes.JSON
  });

  Auditoria.associate = function(models) {
    Auditoria.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
  };

  return Auditoria;
};
