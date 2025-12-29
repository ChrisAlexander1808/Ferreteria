const express = require('express');
const router = express.Router();
const productoController = require('../../controllers/producto.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

router.get('/getAllProductos',auth, validarModulo('PRODUCTOS'), validarPermiso('PRODUCTO_READ'), productoController.getAll);
router.get('/getByIdProducto/:id',auth, validarModulo('PRODUCTOS'), validarPermiso('PRODUCTO_READ'), productoController.getById);
router.post('/createProducto',auth, validarModulo('PRODUCTOS'), validarPermiso('PRODUCTO_CREATE'), productoController.create);
router.put('/updateProducto/:id',auth, validarModulo('PRODUCTOS'), validarPermiso('PRODUCTO_UPDATE'), productoController.update);
router.delete('/deleteProducto/:id',auth, validarModulo('PRODUCTOS'), validarPermiso('PRODUCTO_DELETE'), productoController.delete);
router.get('/productos/next-codigo', auth, productoController.getNextCodigo);

module.exports = router;