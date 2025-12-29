const express = require('express');
const router = express.Router();
const metodoPagoController = require('../../controllers/metodo-pago.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

// LISTAR
router.get('/getAllMetodosPago',auth, validarModulo('MPAGO'), validarPermiso('MPAGO_READ'), metodoPagoController.getAll);

router.get(
  '/getByIdMetodoPago/:id',
  auth,
  validarModulo('MPAGO'),
  validarPermiso('MPAGO_READ'),
  metodoPagoController.getById
);

// CREAR
router.post(
  '/createMetodoPago',
  auth,
  validarModulo('MPAGO'),
  validarPermiso('MPAGO_CREATE'),
  metodoPagoController.create
);

// ACTUALIZAR
router.put(
  '/updateMetodoPago/:id',
  auth,
  validarModulo('MPAGO'),
  validarPermiso('MPAGO_UPDATE'),
  metodoPagoController.update
);

// DESHABILITAR
router.delete(
  '/deleteMetodoPago/:id',
  auth,
  validarModulo('MPAGO'),
  validarPermiso('MPAGO_DELETE'),
  metodoPagoController.delete
);

module.exports = router;
