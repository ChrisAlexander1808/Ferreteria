module.exports = (sequelize, DataTypes) => {
  const BitacoraAcceso = sequelize.define('BitacoraAcceso', {
    fecha: DataTypes.DATE,
    ip: DataTypes.STRING,
    navegador: DataTypes.STRING
  });

  BitacoraAcceso.associate = function(models) {
    BitacoraAcceso.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
  };

  return BitacoraAcceso;
};
