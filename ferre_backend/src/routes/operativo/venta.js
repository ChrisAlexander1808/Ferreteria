const express = require('express');
const router = express.Router();
const ventaController = require('../../controllers/venta.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');


router.get('/getAllVentas',auth, validarModulo('VENTAS'), validarPermiso('VENTAS_VIEW'), ventaController.obtenerVentas);
router.get('/getByIdVenta/:id',auth, validarModulo('VENTAS'),  validarPermiso('VENTAS_VIEW'),  ventaController.obtenerVentaPorId);
router.post('/createVenta',auth, validarModulo('VENTAS'),  validarPermiso('VENTAS_CREATE'),  ventaController.crearVenta);
router.put('/updateVenta/:id',auth, validarModulo('VENTAS'),  validarPermiso('VENTAS_CANCEL'),  ventaController.anularVenta);

module.exports = router;