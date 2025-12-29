const express = require('express');
const router = express.Router();
const usuarioModuloController = require('../../controllers/usuarioModulo.controller');
const { auth, validarModulo } = require('../../middleware/auth.middleware');

router.post('/createUserModulos', auth, usuarioModuloController.create);
router.get('/getByUserModulo/:usuario_id', auth, usuarioModuloController.getByUsuario);
router.delete('/deleteUserModulo/:usuario_id/:modulo_id', auth, usuarioModuloController.delete);

module.exports = router;
