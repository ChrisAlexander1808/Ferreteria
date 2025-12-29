const router = require('express').Router();
const permisoController = require('../../controllers/permiso.controller');
const auth = require('../../middleware/auth.middleware');

router.get('/getAllPermisos', auth.auth, permisoController.getAll);
router.get('/getPermisoById/:id', auth.auth, permisoController.getPermisoById);
router.post('/createPermiso', auth.auth, permisoController.create);
router.put('/updatePermiso/:id', auth.auth, permisoController.update);
router.delete('/deletePermiso/:id', auth.auth, permisoController.delete);

module.exports = router;
