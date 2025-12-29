// src/controllers/proveedor.controller.js
const { Proveedor } = require('../database/init-models');

const proveedorController = {

  // ✅ Obtener todos los proveedores (solo activos de la empresa)
  async getAll(req, res) {
    try {
      const proveedores = await Proveedor.findAll({
        where: { empresa_id: req.user.empresa_id, estado: true },
        order: [['nombre', 'ASC']],
      });

      res.status(200).json({ data: proveedores });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al obtener proveedores', error: error.message });
    }
  },

  // ✅ Obtener proveedor por ID
  async getById(req, res) {
    try {
      const proveedor = await Proveedor.findOne({
        where: { id: req.params.id, empresa_id: req.user.empresa_id },
      });

      if (!proveedor) {
        return res.status(404).json({ message: 'Proveedor no encontrado' });
      }

      res.status(200).json({ data: proveedor });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al obtener proveedor', error: error.message });
    }
  },

  // ✅ Crear proveedor
  async create(req, res) {
    try {
      const { nombre, direccion, telefono, correo, nit } = req.body;

      if (!nombre) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
      }

      // Opcional: validar NIT único por empresa
      if (nit) {
        const existente = await Proveedor.findOne({
          where: { nit, empresa_id: req.user.empresa_id },
        });
        if (existente) {
          return res
            .status(400)
            .json({ message: 'Ya existe un proveedor con ese NIT' });
        }
      }

      const nuevoProveedor = await Proveedor.create({
        nombre,
        direccion,
        telefono,
        correo,
        nit,
        empresa_id: req.user.empresa_id,
        estado: true,
      });

      res
        .status(201)
        .json({ message: 'Proveedor creado correctamente', data: nuevoProveedor });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al crear proveedor', error: error.message });
    }
  },

  // ✅ Actualizar proveedor
  async update(req, res) {
    try {
      const proveedor = await Proveedor.findOne({
        where: { id: req.params.id, empresa_id: req.user.empresa_id },
      });

      if (!proveedor) {
        return res.status(404).json({ message: 'Proveedor no encontrado' });
      }

      await proveedor.update(req.body);

      res.status(200).json({
        message: 'Proveedor actualizado correctamente',
        data: proveedor,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al actualizar proveedor', error: error.message });
    }
  },

  // ✅ Eliminar (deshabilitar) proveedor
  async delete(req, res) {
    try {
      const proveedor = await Proveedor.findOne({
        where: { id: req.params.id, empresa_id: req.user.empresa_id },
      });

      if (!proveedor) {
        return res.status(404).json({ message: 'Proveedor no encontrado' });
      }

      await proveedor.update({ estado: false });

      res
        .status(200)
        .json({ message: 'Proveedor deshabilitado correctamente' });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al deshabilitar proveedor', error: error.message });
    }
  },
};

module.exports = proveedorController;
