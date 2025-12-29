// src/services/setup.service.js
const bcrypt = require('bcrypt');
const {
  Rol,
  Usuario,
  Permiso,
  RolPermiso,
  Modulo,
  Empresa,
  ConfiguracionEmpresa,
  UsuarioModulo
} = require('../database/init-models');

/**
 * Setup base de la aplicación
 * @param {Object} options - Opciones de setup
 * @param {boolean} options.withDummyData - Si true, crea empresa de prueba con usuario SuperAdmin
 */
async function runSetup({ withDummyData = false } = {}) {
  // 1️⃣ Roles base
  const roles = [
    { nombre: 'Administrador', descripcion: 'Acceso completo al sistema' },
    { nombre: 'Cajero', descripcion: 'Gestiona ventas y cobros' },
    { nombre: 'Bodega', descripcion: 'Control de inventario y existencias' },
    { nombre: 'Compras', descripcion: 'Registra compras y proveedores' },
    { nombre: 'Contabilidad', descripcion: 'Acceso a reportes y pagos' }
  ];
  const rolesCreado = [];
  for (const r of roles) {
    const [rol] = await Rol.findOrCreate({ 
      where: { nombre: r.nombre },
      defaults: { descripcion: r.descripcion}
    });
    rolesCreado.push(rol);
  }

  // 2️⃣ Permisos base
  const permisos = [
    // Ventas
    { clave: 'VENTAS_CREATE', descripcion: 'Crear ventas' },
    { clave: 'VENTAS_VIEW', descripcion: 'Ver ventas' },
    { clave: 'VENTAS_CANCEL', descripcion: 'Cancelar ventas' },
    // Compras
    { clave: 'COMPRAS_CREATE', descripcion: 'Registrar compras' },
    { clave: 'COMPRAS_VIEW', descripcion: 'Ver compras' },
    // Inventario
    { clave: 'INV_VIEW', descripcion: 'Ver existencias' },
    { clave: 'INV_ADJUST', descripcion: 'Ajustar inventario' },
    // Pagos
    { clave: 'PAGOS_CREATE', descripcion: 'Registrar pagos y cobros' },
    { clave: 'PAGOS_VIEW', descripcion: 'Ver movimientos de pagos' },
    // Reportes
    { clave: 'REPORT_VIEW', descripcion: 'Ver reportes generales' },
    // Configuración
    { clave: 'CONFIG_USER_MANAGE', descripcion: 'Gestionar usuarios, roles y permisos' }
  ];
  const permisosCreado = [];
  for (const p of permisos) {
    const [permiso] = await Permiso.findOrCreate({ where: { clave: p.clave }, defaults: p });
    permisosCreado.push(permiso);
  }

  // 3️⃣ Relacionar Rol ↔ Permiso
  const adminRol = rolesCreado.find(r => r.nombre === 'Administrador');
  for (const p of permisosCreado) {
    await RolPermiso.findOrCreate({
      where: { rol_id: adminRol.id, permiso_id: p.id }
    });
  }

  // 4️⃣ Módulos base
  const modulos = [
    {nombre: 'Ventas', clave: 'VENTAS', descripcion: 'Gestión de ventas y punto de venta'},
    {nombre: 'Compras', clave: 'COMPRAS', descripcion: 'Pedidos y recepción de mercadería'},
    {nombre: 'Inventario', clave: 'INVENTARIO', descripcion: 'Gestión de existencias y movimientos'},
    {nombre: 'Pagos', clave: 'PAGOS', descripcion: 'Control de cobros, pagos y bancos'},
    {nombre: 'Reportes', clave: 'REPORTES', descripcion: 'Reportes de ventas, inventario y auditoría'},
    {nombre: 'Configuración', clave: 'CONFIG', descripcion: 'Administración del sistema y usuarios'}
    ];
  const modulosCreado = [];
  for (const m of modulos) {
    const [modulo] = await Modulo.findOrCreate({ where: { nombre: m.nombre }, defaults: { clave: m.clave, descripcion: m.descripcion } });
    modulosCreado.push(modulo);
  }

  // 🚩 Solo en DEV: crear empresa ficticia y SuperAdmin
  if (withDummyData) {
    const [empresa] = await Empresa.findOrCreate({
      where: { nombre: 'FERRONIX' },
      defaults: {
        direccion: 'Zona 1, Ciudad',
        telefono: '35658602',
        correo: 'ferronix@gmail.com',
        nit: '9876543',
        estado: true
      }
    });

    await ConfiguracionEmpresa.findOrCreate({
      where: { empresa_id: empresa.id },
      defaults: { logourl: '', moneda: 'GTQ' }
    });

    const hashedPassword = await bcrypt.hash('123456', 10);
    const [usuario] = await Usuario.findOrCreate({
      where: { correo: 'admin@empresax.com' },
      defaults: {
        nombre: 'SuperAdmin',
        contrasena: hashedPassword,
        rol_id: adminRol.id,
        empresa_id: empresa.id,
        activo: true
      }
    });

    for (const m of modulosCreado) {
      await UsuarioModulo.findOrCreate({
        where: { modulo_id: m.id, usuario_id: usuario.id },
        defaults: { habilitado: true }
      });
    }
  }

  console.log('✅ Setup ejecutado correctamente');
}

module.exports = { runSetup };
