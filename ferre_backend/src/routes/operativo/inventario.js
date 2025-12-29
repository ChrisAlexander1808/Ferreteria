const express = require('express');
const router = express.Router();
const inventarioController = require('../../controllers//movimientoInventario.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

router.get('/getAllMovimientos',auth, validarModulo('INVENTARIO'), validarPermiso('INVENTARIO_READ'), inventarioController.getAll);
router.post('/createMovimiento',auth, validarModulo('INVENTARIO'), validarPermiso('INVENTARIO_MOVIMIENTOS_CREATE'), inventarioController.registrarMovimiento);
router.get('/productos/:id/kardex', auth, validarModulo('INVENTARIO'), validarPermiso('INVENTARIO_READ'), inventarioController.obtenerKardexProducto);

module.exports = router;