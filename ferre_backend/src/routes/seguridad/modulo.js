const router = require('express').Router();
const moduloController = require('../../controllers/modulo.controller');
const auth = require('../../middleware/auth.middleware');

router.get('/getAllModulos', auth.auth, moduloController.obtenerModulos);
router.post('/createModulo', auth.auth, moduloController.crearModulo);
router.put('/updateModulo/:id', auth.auth, moduloController.actualizarModulo);
router.get('/getByIdModulo/:id', auth.auth, moduloController.obtenerModuloPorId);

module.exports = router;
