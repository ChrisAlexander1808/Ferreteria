// src/app.js
require('dotenv').config();

const express = require('express');
const app = express();
const sequelize = require('./config/db');
const db = require('./database/init-models');
const isProd = process.env.NODE_ENV === 'production';

//llamar a las rutas
const usuarioRoutes = require('./routes/seguridad/usuarios')
const rolRoutes = require('./routes/seguridad/rol');
const permisoRoutes = require('./routes/seguridad/permiso');
const rolPermisoRoutes = require('./routes/seguridad/rolPermiso');
const usuarioModuloRoutes = require('./routes/seguridad/usuarioModulo');
const moduloRoutes = require('./routes/seguridad/modulo');
const EmpresaRoutes = require('./routes/seguridad/empresa');
const ClienteRoutes = require('./routes/operativo/cliente');
const ProveedorRoutes = require('./routes/operativo/proveedor');
const CategoriaRoutes = require('./routes/operativo/categoria');
const ProductoRoutes = require('./routes/operativo/producto');
const InventarioRoutes = require('./routes/operativo/inventario');
const VentaRoutes = require('./routes/operativo/venta');
const CompraRoutes = require('./routes/operativo/compra');
const ReporteRoutes = require('./routes/operativo/reporte');
const CXCRoutes = require('./routes/financiero/cuentas-por-cobrar');
const CXPRoutes = require('./routes/financiero/cuentas-por-pagar');
const PagoRoutes = require('./routes/financiero/pago');
const MPagoRoutes = require('./routes/financiero/metodo-pago');
const dashboardRoutes = require('./routes/financiero/dashboard');

// Middlewares
app.use(express.json());

// Probar conexión
sequelize.authenticate()
  .then(() => console.log('Conectado a la base de datos ✔'))
  .catch(err => console.error('Error al conectar BD ❌', err));

if (!isProd) {
  db.sequelize.sync({ alter: true })
    .then(() => console.log('Modelos sincronizados con BD 📦'))
    .catch(err => console.error('Error al sincronizar modelos 🚫', err));
}

const allowed = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL?.replace('://', '://www.')
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (allowed.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
  
// Rutas base
app.get('/', (req, res) => {
  res.send('ERP API funcionando 🎯');
});

app.use('/api', usuarioRoutes);
app.use('/api', rolRoutes);
app.use('/api', permisoRoutes);
app.use('/api', rolPermisoRoutes);
app.use('/api', usuarioModuloRoutes);
app.use('/api', moduloRoutes);
app.use('/api', EmpresaRoutes);
app.use('/api', ClienteRoutes);
app.use('/api', ProveedorRoutes);
app.use('/api', CategoriaRoutes);
app.use('/api', ProductoRoutes);
app.use('/api', InventarioRoutes);
app.use('/api', VentaRoutes);
app.use('/api', CompraRoutes);
app.use('/api', ReporteRoutes);
app.use('/api', CXCRoutes);
app.use('/api', PagoRoutes);
app.use('/api', MPagoRoutes);
app.use('/api', CXPRoutes);
app.use('/api', dashboardRoutes);
// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

module.exports = app;