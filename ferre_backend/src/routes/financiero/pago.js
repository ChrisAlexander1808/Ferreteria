const express = require('express');
const router = express.Router();
const pagoController = require('../../controllers/pago.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

// CREAR PAGO (cliente o proveedor)
router.post(
  '/createPago',
  auth,
  validarModulo('PAGOS'),
  validarPermiso('PAGOS_CREATE'),
  pagoController.crearPago
);

// LISTAR PAGOS
router.get(
  '/getAllPagos',
  auth,
  validarModulo('PAGOS'),
  validarPermiso('PAGOS_VIEW'),
  pagoController.getAll
);

// DETALLE DE PAGO
router.get(
  '/getPagoById/:id',
  auth,
  validarModulo('PAGOS'),
  validarPermiso('PAGOS_VIEW'),
  pagoController.getById
);

// ANULAR PAGO
router.put(
  '/anularPago/:id',
  auth,
  validarModulo('PAGOS'),
  validarPermiso('PAGOS_CANCEL'), // 👈 crea este permiso en tu módulo de seguridad
  pagoController.anularPago
);

module.exports = router;
