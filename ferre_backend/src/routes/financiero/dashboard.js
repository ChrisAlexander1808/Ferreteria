const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/dashboard.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

router.get(
  '/dashboard/resumen',
  auth,
  validarModulo('DASHBOARD'),
  validarPermiso('DASHBOARD_VIEW'),
  dashboardController.getResumen
);

module.exports = router;
