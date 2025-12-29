// src/middleware/auth.middleware.js
const { UsuarioModulo, EmpresaModulo, Modulo, Usuario, Rol, RolPermiso, Permiso } = require('../database/init-models');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'mi_secreto';

// 1️⃣ Middleware para verificar JWT y cargar datos de usuario
const auth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Formato de token inválido' });

  try {
    const payload = jwt.verify(token, secret);
    req.user = payload; // id, empresa_id, rol_id, etc.

    // Traer módulos asignados al usuario (desde UsuarioModulo)
    const usuarioModulos = await UsuarioModulo.findAll({
      where: { usuario_id: req.user.id, habilitado: true },
      include: [{ model: Modulo }]
    });
    req.user.modulos = usuarioModulos.map(um => um.Modulo.clave);

    // Traer permisos del rol del usuario
    const rolPermisos = await RolPermiso.findAll({
      where: { rol_id: req.user.rol_id },
      include: [{ model: Permiso }]
    });
    req.user.permisos = rolPermisos.map(rp => rp.Permiso.clave);

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado', error: error.message });
  }
};

// 2️⃣ Middleware dinámico para validar módulo
const validarModulo = (moduloClave) => (req, res, next) => {
  if (!req.user.modulos.includes(moduloClave)) {
    return res.status(403).json({ message: 'Este módulo no está habilitado para ti.' });
  }
  next();
};

// 3️⃣ Middleware dinámico para validar permiso
const validarPermiso = (permisoClave) => (req, res, next) => {
  if (!req.user.permisos.includes(permisoClave)) {
    return res.status(403).json({ message: 'No tienes el permiso necesario.' });
  }
  next();
};

// 4️⃣ Middleware combinado (opcional) para validar módulo + permiso en un solo paso
const validarModuloYPermiso = (moduloClave, permisoClave) => (req, res, next) => {
  if (!req.user.modulos.includes(moduloClave)) {
    return res.status(403).json({ message: 'Este módulo no está habilitado para ti.' });
  }
  if (!req.user.permisos.includes(permisoClave)) {
    return res.status(403).json({ message: 'No tienes el permiso necesario.' });
  }
  next();
};

module.exports = { auth, validarModulo, validarPermiso, validarModuloYPermiso };
