// src/controllers/categoria.controller.js
const { Categoria } = require('../database/init-models');

// ✅ Obtener todas las categorías (solo activas)
exports.getAll = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { estado: true }, // 👈 sin empresa_id de momento
      order: [['id', 'ASC']],
    });

    res.status(200).json({ data: categorias });
  } catch (error) {
    console.error('Error getAllCategorias:', error); // 👈 para ver en consola
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

// ✅ Obtener una categoría por ID
exports.getById = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);

    if (!categoria || categoria.estado === false) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.status(200).json({ data: categoria });
  } catch (error) {
    console.error('Error getByIdCategoria:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener categoría', error: error.message });
  }
};

// ✅ Crear nueva categoría
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ message: 'El nombre de la categoría es obligatorio' });
    }

    // Opcional: evitar duplicados por nombre
    const existe = await Categoria.findOne({
      where: { nombre, estado: true },
    });

    if (existe) {
      return res
        .status(400)
        .json({ message: 'Ya existe una categoría con ese nombre' });
    }

    const nueva = await Categoria.create({
      nombre,
      descripcion,
      estado: true, // 👈 importante para el soft delete
    });

    res
      .status(201)
      .json({ message: 'Categoría creada correctamente', data: nueva });
  } catch (error) {
    console.error('Error createCategoria:', error);
    res
      .status(500)
      .json({ message: 'Error al crear categoría', error: error.message });
  }
};

// ✅ Actualizar categoría
exports.update = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);

    if (!categoria || categoria.estado === false) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await categoria.update(req.body);

    res.status(200).json({
      message: 'Categoría actualizada correctamente',
      data: categoria,
    });
  } catch (error) {
    console.error('Error updateCategoria:', error);
    res
      .status(500)
      .json({ message: 'Error al actualizar categoría', error: error.message });
  }
};

// ✅ Eliminar categoría (cambio de estado)
exports.delete = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);

    if (!categoria || categoria.estado === false) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await categoria.update({ estado: false });

    res
      .status(200)
      .json({ message: 'Categoría deshabilitada correctamente' });
  } catch (error) {
    console.error('Error deleteCategoria:', error);
    res
      .status(500)
      .json({ message: 'Error al eliminar categoría', error: error.message });
  }
};
