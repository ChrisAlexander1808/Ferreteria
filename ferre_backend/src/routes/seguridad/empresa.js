// src/routes/empresa.routes.js
const express = require('express');
const router = express.Router();
const empresaController = require('../../controllers/empresa.controller');
const { auth } = require('../../middleware/auth.middleware');

router.post('/createEmpresa', auth, empresaController.create);
router.get('/getAllEmpresas', auth, empresaController.getAll);
router.get('/getByIdEmpresa/:id', auth, empresaController.getById);
router.put('/updateEmpresa/:id', auth, empresaController.update);
router.delete('/deleteEmpresa/:id', auth, empresaController.delete);

module.exports = router;
