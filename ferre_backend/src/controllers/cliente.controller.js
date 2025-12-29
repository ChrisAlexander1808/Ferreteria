const { Cliente } = require('../database/init-models')

exports.getAll = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: { empresa_id: req.user.empresa_id, estado: true },
      order: [['nombre', 'ASC']]
    });
    res.status(200).json({ data: clientes });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener clientes', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: { id: req.params.id, empresa_id: req.user.empresa_id }
    });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json({ data: cliente });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener cliente', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = { ...req.body, empresa_id: req.user.empresa_id };
    const existente = await Cliente.findOne({
      where: { nit: data.nit, empresa_id: req.user.empresa_id }
    });
    if (existente) return res.status(400).json({ message: 'Ya existe un cliente con ese NIT' });

    const nuevoCliente = await Cliente.create(data);
    res.status(201).json({ message: 'Cliente creado correctamente', data: nuevoCliente });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear cliente', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: { id: req.params.id, empresa_id: req.user.empresa_id }
    });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    await cliente.update(req.body);
    res.status(200).json({ message: 'Cliente actualizado correctamente', data: cliente });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar cliente', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: { id: req.params.id, empresa_id: req.user.empresa_id }
    });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    await cliente.update({ estado: false });
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar cliente', error: err.message });
  }
};