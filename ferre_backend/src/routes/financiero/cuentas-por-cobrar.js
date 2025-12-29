const express = require('express');
const router = express.Router();
const cxcController = require('../../controllers/cuentas-por-cobrar.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

// LISTADO GENERAL
router.get(
  '/getAllCXC',
  auth,
  validarModulo('CXC'),
  validarPermiso('CXC_READ'),
  cxcController.getAllCxC
);

// DETALLE POR ID
router.get(
  '/getCXCById/:id',
  auth,
  validarModulo('CXC'),
  validarPermiso('CXC_READ'),
  cxcController.getCxCById
);

// LISTADO POR CLIENTE
router.get(
  '/getCXCByCliente/:cliente_id',
  auth,
  validarModulo('CXC'),
  validarPermiso('CXC_READ'),
  cxcController.getCxCByCliente
);

module.exports = router;
