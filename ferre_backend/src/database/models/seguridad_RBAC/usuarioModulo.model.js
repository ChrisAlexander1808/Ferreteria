module.exports = (sequelize, DataTypes) => {
  const UsuarioModulo = sequelize.define('UsuarioModulo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    modulo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    habilitado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: 'UsuarioModulo',
    timestamps: true,
  });

  UsuarioModulo.associate = function(models) {
    UsuarioModulo.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
    UsuarioModulo.belongsTo(models.Modulo, { foreignKey: 'modulo_id' });
  };

  return UsuarioModulo;
};
