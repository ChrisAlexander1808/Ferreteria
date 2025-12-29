const router = require('express').Router();
const usuarioController = require('../../controllers/usuario.controller');
const { login_admin } = require('../../controllers/auth.controller');
const auth = require('../../middleware/auth.middleware');

router.get('/getAlluser', auth.auth, usuarioController.getAll);
router.get('/getById/:id', auth.auth, usuarioController.getById);
router.post('/createUser', auth.auth, usuarioController.create);
router.put('/updateUser/:id', auth.auth, usuarioController.update);
router.delete('/deleteUser/:id', auth.auth, usuarioController.delete);
router.post('/login', login_admin);

module.exports = router;
