const {
  RolPermiso,
  Permiso,
  Modulo,
  Usuario,
  UsuarioModulo
} = require('../database/init-models');

/**
 * Sincroniza UsuarioModulo para todos los usuarios de un rol.
 * - Agrega módulos nuevos según los permisos del rol
 * - (Opcional) podrías también eliminar módulos que ya no estén en el rol
 */
async function syncUsuarioModulosPorRol(rol_id) {
  // 1. Obtener permisos del rol (incluyendo el módulo)
  const rolPermisos = await RolPermiso.findAll({
    where: { rol_id },
    include: [
      {
        model: Permiso,
        include: [{ model: Modulo }]
      }
    ]
  });

  // 2. Extraer modulo_id únicos
  const moduloIds = [
    ...new Set(
      rolPermisos
        .map(rp => rp.Permiso && rp.Permiso.modulo_id)
        .filter(id => !!id)
    )
  ];

  // Si el rol no tiene permisos que apunten a módulos, no hacemos nada
  if (moduloIds.length === 0) {
    return;
  }

  // 3. Buscar todos los usuarios que tienen ese rol
  const usuarios = await Usuario.findAll({ where: { rol_id } });

  // 4. Para cada usuario, asegurar que tenga UsuarioModulo para todos esos módulos
  const bulkData = [];

  for (const u of usuarios) {
    for (const modulo_id of moduloIds) {
      bulkData.push({
        usuario_id: u.id,
        modulo_id,
        habilitado: true
      });
    }
  }

  if (bulkData.length > 0) {
    // ignoreDuplicates funciona si tienes una unique key en (usuario_id, modulo_id)
    await UsuarioModulo.bulkCreate(bulkData, { ignoreDuplicates: true });
  }

  // 👉 Si quisieras que UsuarioModulo quede 100% igual al rol,
  // podrías opcionalmente borrar asignaciones que sobren:
  //
  // await UsuarioModulo.destroy({
  //   where: {
  //     usuario_id: usuarios.map(u => u.id),
  //     modulo_id: { [Op.notIn]: moduloIds }
  //   }
  // });
}

module.exports = {
  syncUsuarioModulosPorRol
};
