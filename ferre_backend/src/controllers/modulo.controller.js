// src/controllers/modulo.controller.js
const { Modulo, Permiso } = require('../database/init-models');

// Helper para generar permisos según tipo
const generarPermisosPorModulo = async (modulo) => {
  const baseClave = modulo.clave.toUpperCase();
  const moduloId = modulo.id;

  let permisos = [];

  if (modulo.descripcion === 'OPERATIVO') {
    permisos = [
      { clave: `${baseClave}_CREATE`, descripcion: `Crear ${modulo.nombre}` },
      { clave: `${baseClave}_READ`, descripcion: `Ver ${modulo.nombre}` },
      { clave: `${baseClave}_UPDATE`, descripcion: `Actualizar ${modulo.nombre}` },
      { clave: `${baseClave}_DELETE`, descripcion: `Eliminar ${modulo.nombre}` },
    ];
  } 
  else if (modulo.descripcion === 'REPORTE') {
    permisos = [
      { clave: `${baseClave}_READ`, descripcion: `Ver reportes de ${modulo.nombre}` }
    ];
  }

  const permisosGenerados = [];

  for (let p of permisos) {
    const [permiso, created] = await Permiso.findOrCreate({
      where: {
        clave: p.clave,
        modulo_id: moduloId, 
      },
      defaults: {
        clave: p.clave,                
        descripcion: p.descripcion,
        modulo_id: moduloId,            
      }
    });

    permisosGenerados.push(permiso);
  }

  return permisosGenerados;

};

// Crear un nuevo módulo
const crearModulo = async (req, res) => {
  try {
    const { nombre, clave, descripcion } = req.body;
    
    // Verificar si ya existe
    const existe = await Modulo.findOne({ where: { nombre } });
    if (existe) {
      return res.status(400).json({ message: 'Ya existe un módulo con ese nombre' });
    }

    const nuevoModulo = await Modulo.create({ nombre, clave, descripcion });

    // 🚀 Crear permisos automáticamente
    const permisosGenerados = await generarPermisosPorModulo(nuevoModulo);

    res.status(201).json({
      message: 'Módulo y permisos creadoa correctamente',
      data:{
        modulo: nuevoModulo,
        permisos: permisosGenerados
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear módulo', error: error.message });
  }
};

// Obtener todos los módulos
const obtenerModulos = async (req, res) => {
  try {
    const modulos = await Modulo.findAll({
      order: [['id', 'ASC']]
    });
    res.status(200).json({data: modulos});
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener módulos', error: error.message });
  }
};

// Obtener un módulo por ID
const obtenerModuloPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const modulo = await Modulo.findByPk(id);
    if (!modulo) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    res.status(200).json({data: modulo});
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener módulo', error: error.message });
  }
};

// Actualizar un módulo
const actualizarModulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, clave, descripcion } = req.body;

    const modulo = await Modulo.findByPk(id);
    if (!modulo) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    await modulo.update({ nombre, clave, descripcion });
    res.status(200).json({ message: 'Módulo actualizado correctamente', data: modulo });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar módulo', error: error.message });
  }
};

module.exports = {
  crearModulo,
  obtenerModulos,
  obtenerModuloPorId,
  actualizarModulo
};
