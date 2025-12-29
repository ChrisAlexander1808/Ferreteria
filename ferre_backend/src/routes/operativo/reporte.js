const express = require('express');
const router = express.Router();
const reporteController = require('../../controllers/reportes.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

// 🔐 Todas las rutas requieren autenticación
router.use(auth);

router.get('/getGeneral', validarModulo('REPORTES'), validarPermiso('REPORT_VIEW'), reporteController.obtenerResumenGeneral);
router.get('/getMensual',  validarModulo('REPORTES'),  validarPermiso('REPORT_VIEW'),  reporteController.obtenerVentasComprasMensuales);

module.exports = router;