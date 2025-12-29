// src/database/init-models.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Importar todos los modelos
const Empresa = require('./models/seguridad_RBAC/empresa.model')(sequelize, DataTypes);
const Modulo = require('./models/seguridad_RBAC/modulo.model')(sequelize, DataTypes);
const Rol = require('./models/seguridad_RBAC/rol.model')(sequelize, DataTypes);
const RolPermiso = require('./models/seguridad_RBAC/rolPermiso.model')(sequelize, DataTypes);
const Permiso = require('./models/seguridad_RBAC/permiso.model')(sequelize, DataTypes);
const Usuario = require('./models/seguridad_RBAC/usuario.model')(sequelize, DataTypes);
const UsuarioModulo = require('./models/seguridad_RBAC/usuarioModulo.model')(sequelize, DataTypes);
const ConfiguracionEmpresa = require('./models/seguridad_RBAC/configEmpresa.model')(sequelize, DataTypes);
const Auditoria = require('./models/seguridad_RBAC/auditoria.model')(sequelize, DataTypes);
const BitacoraAcceso = require('./models/seguridad_RBAC/bitacoraAcceso.model')(sequelize, DataTypes);
const Cliente = require('./models/operativo/cliente.model')(sequelize, DataTypes);
const Proveedor = require('./models/operativo/proveedor.model')(sequelize, DataTypes);
const Categoria = require('./models/operativo/categoria.model')(sequelize, DataTypes);
const Producto = require('./models/operativo/producto.model')(sequelize, DataTypes);
const MovimientoInventario = require('./models/operativo/movimiento-inventario.model')(sequelize, DataTypes);
const Venta = require('./models/operativo/venta.model')(sequelize, DataTypes);
const DetalleVenta = require('./models/operativo/detalle-venta.model')(sequelize, DataTypes);
const Compra = require('./models/operativo/compra.model')(sequelize, DataTypes);
const DetalleCompra = require('./models/operativo/detalle-compra.model')(sequelize, DataTypes);
const GastoCompra = require('./models/operativo/gasto-compra.model')(sequelize, DataTypes);
const CuentaPorCobrar = require('./models/financiero/cuentas-por-cobrar.model')(sequelize, DataTypes);
const CuentaPorPagar = require('./models/financiero/cuentas-por-pagar.model')(sequelize, DataTypes);
const MetodoPago = require('./models/financiero/metodo-pago.model')(sequelize, DataTypes);
const Pago = require('./models/financiero/pago.model')(sequelize, DataTypes);
const PagoDetalle = require('./models/financiero/pagoDetalle.model')(sequelize, DataTypes);
// Definir asociaciones
Empresa.associate({ Usuario, ConfiguracionEmpresa, Modulo, Rol, RolPermiso, Permiso, UsuarioModulo, Cliente, Proveedor, Venta, Compra });
Modulo.associate({ Empresa, UsuarioModulo, Usuario, Permiso });
Rol.associate({ Permiso, Usuario, RolPermiso, Empresa });
Usuario.associate({ Rol, Empresa, BitacoraAcceso, Auditoria, UsuarioModulo });
UsuarioModulo.associate({ Usuario, Modulo, Empresa})
ConfiguracionEmpresa.associate({ Empresa });
Permiso.associate({ Rol, RolPermiso, Modulo });
BitacoraAcceso.associate({ Usuario });
Auditoria.associate({ Usuario });
RolPermiso.associate ({ Rol, Permiso, Empresa}); 
Cliente.associate({ Empresa });
Proveedor.associate({ Empresa });
Categoria.associate({ Producto });
Producto.associate({ Categoria, MovimientoInventario, Venta, Compra });
MovimientoInventario.associate({ Producto });
Venta.associate({ DetalleVenta, Empresa, Cliente, CuentaPorCobrar });
DetalleVenta.associate({ Producto, Venta });
Compra.associate({ Proveedor, Empresa, DetalleCompra, GastoCompra, CuentaPorPagar });
DetalleCompra.associate({ Compra, Producto });
GastoCompra.associate({ Compra });
CuentaPorCobrar.associate({ Venta, Cliente, Empresa, PagoDetalle});
CuentaPorPagar.associate({ Compra, Proveedor, Empresa, PagoDetalle});
MetodoPago.associate({ Empresa, Pago});
Pago.associate({ Empresa, Cliente, Proveedor, MetodoPago, PagoDetalle});
PagoDetalle.associate({ Pago, CuentaPorCobrar, CuentaPorPagar });


const models = {
  Empresa,
  Modulo,
  Rol,
  RolPermiso,
  Permiso,
  Usuario,
  UsuarioModulo,
  ConfiguracionEmpresa,
  Auditoria,
  BitacoraAcceso,
  Cliente,
  Proveedor,
  Categoria,
  Producto,
  MovimientoInventario,
  Venta,
  DetalleVenta,
  Compra,
  DetalleCompra,
  GastoCompra,
  CuentaPorCobrar,
  CuentaPorPagar,
  MetodoPago,
  Pago,
  PagoDetalle
};

Usuario.belongsToMany(models.Modulo, { through: models.UsuarioModulo, foreignKey: 'usuario_id' });
Modulo.belongsToMany(models.Usuario, { through: models.UsuarioModulo, foreignKey: 'modulo_id' });

// Exportar
module.exports = {
  sequelize,
  Empresa,
  Modulo,
  Rol,
  Usuario, 
  UsuarioModulo, 
  ConfiguracionEmpresa, 
  Permiso,
  RolPermiso,
  Auditoria,
  BitacoraAcceso,
  Cliente, 
  Proveedor,
  Categoria,
  Producto,
  MovimientoInventario,
  Venta,
  DetalleVenta,
  Compra,
  DetalleCompra,
  GastoCompra,
  CuentaPorCobrar,
  CuentaPorPagar,
  MetodoPago,
  Pago,
  PagoDetalle
};



