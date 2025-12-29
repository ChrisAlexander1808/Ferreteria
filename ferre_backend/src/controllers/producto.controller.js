// src/controllers/producto.controller.js
const { Producto, Categoria } = require('../database/init-models');
const { Op } = require('sequelize');

// ✅ Obtener todos los productos
exports.getAll = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: {estado: true},
      include: [{ model: Categoria, as: 'categoria' }],
      order: [['id', 'ASC']]
    });
    res.status(200).json({ data: productos });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// ✅ Obtener producto por ID
exports.getById = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [{ model: Categoria, as: 'categoria' }]
    });
    if (!producto || producto.estado === false){
        return res.status(404).json({ message: 'Producto no encontrado' });
    } 
    res.status(200).json({ data: producto });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
};

// ✅ Crear producto
exports.create = async (req, res) => {
  try {
    const payload = {
      nombre: req.body.nombre,
      codigo: req.body.codigo,
      descripcion: req.body.descripcion,
      precio_compra: req.body.precio_compra,
      precio_venta: req.body.precio_venta,
      unidad_medida: req.body.unidad_medida,
      categoria_id: req.body.categoria_id,
      stock_actual: 0, // 👈 SIEMPRE 0 al crear
    };

    const nuevo = await Producto.create(payload);

    res.status(201).json({
      message: 'Producto creado correctamente',
      data: nuevo,
    });
    res.status(201).json({ message: 'Producto creado correctamente', data: nuevo });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

// ✅ Actualizar producto
exports.update = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto || producto.estado === false){
      return res.status(404).json({ message: 'Producto no encontrado' });
    } 

    await producto.update(req.body);
    res.status(200).json({ message: 'Producto actualizado correctamente', data: producto });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

// ✅ Deshabilitar producto
exports.delete = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto){
      return res.status(404).json({ message: 'Producto no encontrado' });
    } 

    if (producto.stock_actual > 0) {  // 👈 regla de negocio
    return res.status(400).json({
      message: 'No se puede deshabilitar un producto con stock mayor a 0.',
    });
    }

    await producto.update({ estado: false });
    res.status(200).json({ message: 'Producto deshabilitado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};

exports.getNextCodigo = async (req, res) => {
  try {
    const { categoria_id, nombre } = req.query;

    if (!categoria_id || !nombre) {
      return res.status(400).json({ message: 'categoria_id y nombre son requeridos' });
    }

    const categoria = await Categoria.findByPk(categoria_id);
    if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });

    const take3 = (txt) => {
      const clean = (txt || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim().toUpperCase()
        .replace(/\s+/g, '');
      return (clean + 'XXX').substring(0, 3);
    };

    const prefix = `${take3(categoria.nombre)}${take3(nombre)}`;

    // buscar el máximo correlativo actual
    const last = await Producto.findOne({
      where: { codigo: { [Op.like]: `${prefix}%` } },
      order: [['codigo', 'DESC']]
    });

    let next = 100;

    if (last?.codigo) {
      const num = Number(String(last.codigo).replace(prefix, ''));
      if (!isNaN(num)) next = num + 1;
    }

    res.json({ data: { codigo: `${prefix}${next}` } });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar código', error: error.message });
  }
};
