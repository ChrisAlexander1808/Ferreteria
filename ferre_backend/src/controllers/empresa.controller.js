const { Empresa, ConfiguracionEmpresa } = require('../database/init-models');

// ✅ Crear una nueva empresa junto con su configuración
exports.create = async (req, res) => {
  try {
    const { nombre, direccion, telefono, correo, nit, estado, logourl, moneda } = req.body;


    // Validaciones básicas
    if (!nombre || !nit) {
      return res.status(400).json({ message: 'Nombre y NIT son obligatorios' });
    }

    // Verificar si ya existe una empresa con el mismo NIT
    const existe = await Empresa.findOne({ where: { nit } });
    if (existe) {
      return res.status(409).json({ message: 'Ya existe una empresa registrada con este NIT' });
    }

    // Crear empresa
    const empresa = await Empresa.create({
      nombre,
      direccion,
      telefono,
      correo,
      nit,
      estado: estado ?? true
    });

    // Crear configuración asociada
    const configuracion = await ConfiguracionEmpresa.create({
      logourl: logourl || '',
      moneda: moneda || 'GTQ',
      empresa_id: empresa.id
    });

    return res.status(201).json({
      message: 'Empresa creada exitosamente',
      empresa,
      configuracion
    });


  } catch (error) {
    console.error('Error al crear empresa:', error);
    return res.status(500).json({ message: 'Error interno al crear empresa', error: error.message });
  }
};

// ✅ Obtener todas las empresas con su configuración
exports.getAll = async (req, res) => {
  try {
    const empresas = await Empresa.findAll({
      include: [{ model: ConfiguracionEmpresa, as: 'configuracion' }],
      order: [['createdAt', 'ASC']]
    });
    return res.status(200).json({ data: empresas });
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    return res.status(500).json({ message: 'Error interno al obtener empresas', error: error.message });
  }
};

// ✅ Obtener una empresa por ID con su configuración
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id, {
      include: [{ model: ConfiguracionEmpresa, as: 'configuracion' }]
    });


    if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
    return res.status(200).json({ data: empresa });


  } catch (error) {
    console.error('Error al obtener empresa:', error);
    return res.status(500).json({ message: 'Error interno al obtener empresa', error: error.message });
  }
};

// ✅ Actualizar empresa y/o configuración
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, correo, nit, estado, logourl, moneda } = req.body;


    const empresa = await Empresa.findByPk(id);
    if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });

    await empresa.update({ nombre, direccion, telefono, correo, nit, estado });

    const configuracion = await ConfiguracionEmpresa.findOne({ where: { empresa_id: id } });
    if (configuracion) {
      await configuracion.update({ logourl: logourl || configuracion.logourl, moneda: moneda || configuracion.moneda });
    } else {
      await ConfiguracionEmpresa.create({
        logourl: logourl || '',
        moneda: moneda || 'GTQ',
        empresa_id: id
      });
    }

    return res.status(200).json({ message: 'Empresa actualizada correctamente', empresa });


  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    return res.status(500).json({ message: 'Error interno al actualizar empresa', error: error.message });
  }
};

// ✅ Deshabilitar empresa (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);
    if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });


    await empresa.update({ estado: false });
    return res.status(200).json({ message: 'Empresa deshabilitada correctamente' });


  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    return res.status(500).json({ message: 'Error interno al eliminar empresa', error: error.message });
  }
};
