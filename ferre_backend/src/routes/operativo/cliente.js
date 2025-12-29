// src/routes/cliente.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../../controllers/cliente.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

router.get('/getAllClientes', auth, validarModulo('CLIENTES'), validarPermiso('CLIENTES_READ'), clienteController.getAll);
router.get('/getByIdCliente/:id', auth, validarModulo('CLIENTES'), validarPermiso('CLIENTES_READ'), clienteController.getById);
router.post('/createCliente', auth, validarModulo('CLIENTES'), validarPermiso('CLIENTES_CREATE'), clienteController.create);
router.put('/updateCliente/:id', auth, validarModulo('CLIENTES'), validarPermiso('CLIENTES_UPDATE'), clienteController.update);
router.delete('/deleteCliente/:id', auth, validarModulo('CLIENTES'), validarPermiso('CLIENTES_DELETE'), clienteController.delete);

module.exports = router;
