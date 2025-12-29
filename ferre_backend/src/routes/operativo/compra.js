const express = require('express');
const router = express.Router();
const compraController = require('../../controllers/compra.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');


router.get('/getAllCompras',auth, validarModulo('COMPRAS'), validarPermiso('COMPRAS_VIEW'), compraController.obtenerCompras);
router.get('/getByIdCompra/:id',auth,  validarModulo('COMPRAS'),  validarPermiso('COMPRAS_VIEW'),  compraController.obtenerCompraPorId);
router.post('/createCompra',auth,  validarModulo('COMPRAS'),  validarPermiso('COMPRAS_CREATE'),  compraController.crearCompra);
router.put('/anularCompra/:id',auth,  validarModulo('COMPRAS'),  validarPermiso('COMPRAS_ANULAR'),  compraController.anularCompra);

module.exports = router;