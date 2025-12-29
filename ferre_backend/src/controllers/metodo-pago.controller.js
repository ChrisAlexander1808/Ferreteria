// src/controllers/metodo-pago.controller.js
const { MetodoPago } = require('../database/init-models');

exports.getAll = async (req, res) => {
  try {

    const metodos = await MetodoPago.findAll({
      where: { activo: true },
    });

    res.status(200).json({ data: metodos });

  } catch (err) {
    res.status(500).json({
      mensaje: 'Error al obtener métodos de pago',
      error: err.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    const metodo = await MetodoPago.findOne({
      where: { id, empresa_id },
    });

    if (!metodo) {
      return res.status(404).json({ mensaje: 'Método de pago no encontrado' });
    }

    return res.json({ data: metodo });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al obtener método de pago',
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio.' });
    }

    const nuevo = await MetodoPago.create({
      empresa_id,
      nombre,
      descripcion: descripcion || null,
      activo: true,
    });

    return res.status(201).json({
      mensaje: 'Método de pago creado correctamente',
      data: nuevo,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al crear método de pago',
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const metodo = await MetodoPago.findOne({
      where: { id, empresa_id },
    });

    if (!metodo) {
      return res.status(404).json({ mensaje: 'Método de pago no encontrado' });
    }

    metodo.nombre = nombre ?? metodo.nombre;
    metodo.descripcion = descripcion ?? metodo.descripcion;

    if (activo !== undefined) {
      metodo.activo = activo;
    }

    await metodo.save();

    return res.json({
      mensaje: 'Método de pago actualizado correctamente',
      data: metodo,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al actualizar método de pago',
      error: error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    const metodo = await MetodoPago.findOne({
      where: { id, empresa_id },
    });

    if (!metodo) {
      return res.status(404).json({ mensaje: 'Método de pago no encontrado' });
    }

    metodo.activo = false;
    await metodo.save();

    return res.json({ mensaje: 'Método de pago deshabilitado correctamente' });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al deshabilitar método de pago',
      error: error.message,
    });
  }
};
