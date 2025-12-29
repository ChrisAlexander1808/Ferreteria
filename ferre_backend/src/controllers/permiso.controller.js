const { Permiso, Modulo } = require('../database/init-models');

exports.getAll = async (req, res) => {
  try {
    const permisos = await Permiso.findAll({
      include: [{ model: Modulo }]
    });
    res.status(200).json({ data: permisos });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener permisos', error: err.message });
  }
};

exports.getPermisoById = async (req, res) => {
  try {
    const { id } = req.params;
    const permiso = await Permiso.findByPk(id, {
      include: [
        {
          model: Modulo
        }
      ]
    });
    if (!permiso) {
      return res.status(404).json({ error: 'Permiso no encontrado.' });
    }
    res.status(200).json({ data: permiso });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el permiso.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { clave, descripcion, modulo_id } = req.body;

    const nuevoPermiso = await Permiso.create({
      clave,
      descripcion,
      modulo_id
    });

    res.status(201).json({ data: nuevoPermiso });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear permiso', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { clave, descripcion, modulo_id } = req.body;

    const permiso = await Permiso.findByPk(id);

    if (!permiso) {
      return res.status(404).json({ message: 'Permiso no encontrado' });
    }

    permiso.clave = clave ?? permiso.clave;
    permiso.descripcion = descripcion ?? permiso.descripcion;
    permiso.modulo_id = modulo_id ?? permiso.modulo_id;

    await permiso.save();

    return res.json({
      message: 'Permiso actualizado correctamente',
      data: permiso
    });
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    return res.status(500).json({
      message: 'Error al actualizar permiso',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Permiso.destroy({ where: { id } });

    if (!deleted)
      return res.status(404).json({ message: 'Permiso no encontrado' });

    res.status(200).json({ message: 'Permiso eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar permiso', error: err.message });
  }
};
