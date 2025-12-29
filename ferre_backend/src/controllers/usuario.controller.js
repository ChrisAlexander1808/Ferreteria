const { Usuario, Rol, Empresa } = require('../database/init-models');
const { asignarModulosPorRol } = require('../helpers/usuarioModulo.helper');
const bcrypt = require('bcrypt');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ 
      where: { 
        empresa_id: req.user.empresa_id,
        activo: true
       },
       include: [
        { model: Rol },
        { model: Empresa }
       ] 
      });
    res.status(200).json({ data: usuarios });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      where: { 
        id: req.params.id,
        empresa_id: req.user.empresa_id
      },
      include: [
        { model: Rol },
        { model: Empresa }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ data: usuario });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuario', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { contrasena, ...userData } = req.body;

    // Validar si ya existe el correo en esa empresa (yo quitaría rol_id de aquí, ojo)
    const existente = await Usuario.findOne({
      where: { 
        correo: userData.correo, 
        empresa_id: userData.empresa_id,
        // si quieres que NO pueda repetir correo con otro rol, quita rol_id de la condición
        // rol_id: userData.rol_id
      },
    });

    if (existente) {
      return res.status(400).json({ message: 'El correo ya está registrado en esta empresa' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await Usuario.create(
      { 
        ...userData, 
        contrasena: hashedPassword
      }
    );

    // 👉 aquí viene la magia: asignar módulos según el rol del usuario
    const modulosAsignados = await asignarModulosPorRol(nuevoUsuario);

    return res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      data: {
        usuario: nuevoUsuario,
        modulos: modulosAsignados
      }
    });

  } catch (err) {
    console.error('Error al crear usuario:', err);
    return res.status(500).json({ 
      message: 'Error al crear usuario', 
      error: err.message 
    });
  }
};


exports.update = async (req, res) => {
  try {
    const { contrasena, ...updateData } = req.body;

    const usuario = await Usuario.findOne({
      where: { 
        id: req.params.id,
        empresa_id: req.user.empresa_id
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado o no pertenece a tu empresa' });
    }

    // Si viene contraseña, hashearla antes de actualizar
    if (contrasena) {
      updateData.contrasena = await bcrypt.hash(contrasena, 10);
    }

    await usuario.update(updateData);

    res.status(200).json({ message: 'Usuario actualizado exitosamente', data: usuario });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      where: { 
        id: req.params.id,
        empresa_id: req.user.empresa_id
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado o no pertenece a tu empresa' });
    }

    await usuario.update({ activo: false });

    res.status(200).json({ message: 'Usuario deshabilitado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: err.message });
  }
};
