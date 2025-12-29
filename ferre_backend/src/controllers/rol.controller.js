const { Rol, RolPermiso } = require('../database/init-models');
const { syncUsuarioModulosPorRol } = require('../helpers/rol.helper');

exports.getAll = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.status(200).json({ data: roles });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener roles', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await Rol.findOne({
      where: {
        id
      },
    });

    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    return res.status(200).json({ data: rol });
  } catch (error) {
    console.error('Error al obtener rol por id:', error);
    return res.status(500).json({
      message: 'Error al obtener rol',
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const newRol = await Rol.create({ nombre, descripcion });

    res.status(201).json({ data: newRol });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear rol', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const [updated] = await Rol.update(
      { nombre },
      { where: { id } }
    );

    if (!updated)
      return res.status(404).json({ message: 'Rol no encontrado o pertenece a otra empresa' });

    const rolActualizado = await Rol.findByPk(id);
    res.status(200).json({ data: rolActualizado });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar rol', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Rol.destroy({ where: { id, empresa_id: req.user.empresa_id } });

    if (!deleted)
      return res.status(404).json({ message: 'Rol no encontrado o pertenece a otra empresa' });

    res.status(200).json({ message: 'Rol eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar rol', error: err.message });
  }
};

exports.updateWithPermissions = async (req, res) => {
  const t = await Rol.sequelize.transaction();
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisosSeleccionados } = req.body;

    const rol = await Rol.findByPk(id, { transaction: t });
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // 1) Actualizar nombre / descripción
    await rol.update({ nombre, descripcion }, { transaction: t });

    // 2) Borrar todas las relaciones rol-permiso actuales
    await RolPermiso.destroy({ where: { rol_id: id }, transaction: t });

    // 3) Crear las nuevas relaciones
    const uniquePermisos = [
      ...new Set((permisosSeleccionados || []).map(p => p.permisoId)),
    ];

    if (uniquePermisos.length > 0) {
      const nuevasRelaciones = uniquePermisos.map(permiso_id => ({
        rol_id: id,
        permiso_id,
      }));

      await RolPermiso.bulkCreate(nuevasRelaciones, { transaction: t });
    }

    await t.commit();

    // 4) Sincronizar módulos de todos los usuarios con ese rol
    await syncUsuarioModulosPorRol(id);

    return res.status(200).json({
      message: 'Rol actualizado correctamente con permisos',
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar rol con permisos:', error);
    return res.status(500).json({
      message: 'Error al actualizar rol con permisos',
      error: error.message,
    });
  }
};
