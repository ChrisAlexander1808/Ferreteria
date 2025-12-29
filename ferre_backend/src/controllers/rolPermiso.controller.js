const { RolPermiso, Rol, Permiso, Modulo } = require('../database/init-models');

exports.getAll = async (req, res) => {
  try {
    const rolPermisos = await RolPermiso.findAll({      
      include: [
        { model: Rol },
        { model: Permiso}
      ],
    });
    res.status(200).json({ data: rolPermisos });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener RolPermisos', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { rol_id, permiso_id } = req.body;

    const nuevaRelacion = await RolPermiso.create({
      rol_id,
      permiso_id,
    });

     // 🔁 Sincronizar módulos de todos los usuarios con ese rol
    await syncUsuarioModulosPorRol(rol_id);

    res.status(201).json({ data: nuevaRelacion });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear RolPermiso', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero obtenemos la relación para saber a qué rol afecta
    const relacion = await RolPermiso.findByPk(id);

    if (!relacion) {
      return res.status(404).json({ message: 'Relación no encontrada o pertenece a otra empresa' });
    }

    const rol_id = relacion.rol_id;

    await RolPermiso.destroy({ where: { id } });

    // 🔁 Volvemos a sincronizar módulos de los usuarios de ese rol
    await syncUsuarioModulosPorRol(rol_id);

    res.status(200).json({ message: 'Relación eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar RolPermiso', error: err.message });
  }
};

// Obtener los permisos de un rol por ID de rol
exports.getPermissionsByRoleId = async (req, res) => {   
  try {
    const { id } = req.params;
    const rolId = Number(id);

    const rolePermissions = await RolPermiso.findAll({
      where: { rol_id: rolId },
      include: [
        {
          model: Permiso,
          include: [{ model: Modulo }]
        },
        { model: Rol }
      ]
    });

    if (!rolePermissions.length) {
      return res.status(404).json({ error: 'No se encontraron permisos para este rol.' });
    }

    return res.status(200).json({ data: rolePermissions });
  } catch (error) {
    console.error('Error al obtener los permisos del rol:', error);
    return res.status(500).json({
      message: 'Error al obtener los permisos del rol.',
      error: error.message
    });
  }
};

