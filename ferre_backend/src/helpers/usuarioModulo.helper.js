// helpers/usuarioModulo.helper.js (por ejemplo)
const { RolPermiso, Permiso, UsuarioModulo } = require('../database/init-models');

const asignarModulosPorRol = async (usuario, transaction = null) => {
  // Traemos los permisos del rol, con el Permiso asociado
  const rolPermisos = await RolPermiso.findAll({
    where: { rol_id: usuario.rol_id },
    include: [{ model: Permiso }],
    transaction
  });

  // Sacamos los modulo_id de esos permisos
  const moduloIds = [
    ...new Set(
      rolPermisos
        .map(rp => rp.Permiso && rp.Permiso.modulo_id)
        .filter(Boolean)
    )
  ];

  if (!moduloIds.length) {
    return [];
  }

  const data = moduloIds.map(modulo_id => ({
    usuario_id: usuario.id,
    modulo_id,
    habilitado: true
  }));

  await UsuarioModulo.bulkCreate(data, {
    ignoreDuplicates: true, // por si vuelves a asignar
    transaction
  });

  return moduloIds;
};

module.exports = { asignarModulosPorRol };
