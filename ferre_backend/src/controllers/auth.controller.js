const { Usuario, Rol, RolPermiso, Permiso, Modulo, UsuarioModulo } = require('../database/init-models')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var moment = require('moment');
var secret = process.env.JWT_SECRET;


const createToken = function(user) {
    var payload = {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        empresa_id: user.empresa_id,
        rol_id: user.rol_id,
        iat: moment().unix(),
        exp: moment().add(1, 'day').unix(),
    };

    return jwt.sign(payload, secret);
};

exports.login_admin = async function(req,res) {
  try {
    const { correo, contrasena } = req.body;

    const user = await Usuario.findOne({
      where: { correo },
      include: [
        {
          model: Rol,
          include: [
            {
              model: Permiso,
              through: { model: RolPermiso, attributes: [] }, // relación N:M
            }
          ]
        },
        {
          model: Modulo,
          through: { model: UsuarioModulo, attributes: [] } // relación N:M
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!isValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Crear token
    const token = createToken(user);

    // Mapeamos módulos y permisos a arrays simples
    const modulos = user.Modulos?.map(m => m.clave || m.nombre) || [];
    const permisos = user.Rol?.Permisos?.map(p => p.clave || p.nombre) || [];

    return res.json({
      data: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        empresa_id: user.empresa_id,
        rol_id: user.rol_id,
        modulos,
        permisos
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en login', error });
  }
};

