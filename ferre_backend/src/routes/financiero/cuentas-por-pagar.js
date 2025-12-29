const express = require('express');
const router = express.Router();
const cxpController = require('../../controllers/cuentas-por pagar.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

router.get(
  '/getAllCXP',
  auth,
  validarModulo('CXP'),
  validarPermiso('CXP_READ'),
  cxpController.getAllCXP
);

router.get(
  '/getCXPById/:id',
  auth,
  validarModulo('CXP'),
  validarPermiso('CXP_READ'),
  cxpController.getCXPById
);


module.exports = router;
