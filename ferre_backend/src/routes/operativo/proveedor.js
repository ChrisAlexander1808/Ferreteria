const express = require('express');
const router = express.Router();
const proveedorController = require('../../controllers/proveedor.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

router.get('/getAllProveedores',auth, validarModulo('PROVEEDORES'), validarPermiso('PROVEEDOR_READ'), proveedorController.getAll);
router.get('/getByIdProveedor/:id',auth,  validarModulo('PROVEEDORES'),  validarPermiso('PROVEEDOR_READ'),  proveedorController.getById);
router.post('/createProveedor',auth,  validarModulo('PROVEEDORES'),  validarPermiso('PROVEEDOR_CREATE'),  proveedorController.create);
router.put('/updateProveedor/:id',auth,  validarModulo('PROVEEDORES'),  validarPermiso('PROVEEDOR_UPDATE'),  proveedorController.update);
router.delete('/deleteProveedor/:id',auth,  validarModulo('PROVEEDORES'),  validarPermiso('PROVEEDOR_DELETE'),  proveedorController.delete);

module.exports = router;