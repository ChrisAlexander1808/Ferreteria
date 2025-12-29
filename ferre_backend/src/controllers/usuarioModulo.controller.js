const { UsuarioModulo, Usuario, Modulo } = require('../database/init-models');

// ✅ Crear asignación de módulos a un usuario
exports.create = async (req, res) => {
  try {
    const { usuario_id, modulos } = req.body; // modulos = [1,2,3]

    // Validar que el usuario pertenece a la misma empresa
    const usuario = await Usuario.findOne({ where: { id: usuario_id } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado o no pertenece a tu empresa.' });
    }

    // Crear registros en UsuarioModulo
    const data = modulos.map(modulo_id => ({
      usuario_id,
      modulo_id,
      habilitado: true
    }));

    await UsuarioModulo.bulkCreate(data, { ignoreDuplicates: true });

    res.status(201).json({ message: 'Módulos asignados correctamente al usuario.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al asignar módulos al usuario', error: err.message });
  }
};

// ✅ Obtener módulos habilitados de un usuario
exports.getByUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const modulos = await UsuarioModulo.findAll({
      where: { usuario_id, habilitado: true },
      include: [{ model: Modulo }]
    });

    res.status(200).json({ data: modulos });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener módulos del usuario', error: err.message });
  }
};

// ✅ Eliminar módulos asignados a un usuario
exports.delete = async (req, res) => {
  try {
    const { usuario_id, modulo_id } = req.params;

    const deleted = await UsuarioModulo.destroy({
      where: { usuario_id, modulo_id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Asignación no encontrada.' });
    }

    res.status(200).json({ message: 'Módulo removido correctamente del usuario.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al remover módulo del usuario', error: err.message });
  }
};

