module.exports = (sequelize, DataTypes) => {
  const ConfiguracionEmpresa = sequelize.define('ConfiguracionEmpresa', {
    logourl: DataTypes.STRING,
    moneda: DataTypes.STRING,
    empresa_id: { type: DataTypes.INTEGER, allowNull: false, unique: true }
  });

  ConfiguracionEmpresa.associate = function(models) {
    ConfiguracionEmpresa.belongsTo(models.Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
  };

  return ConfiguracionEmpresa;
};

