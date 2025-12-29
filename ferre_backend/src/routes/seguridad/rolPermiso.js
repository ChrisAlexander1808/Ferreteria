const router = require('express').Router();
const rolPermisoController = require('../../controllers/rolPermiso.controller');
const auth = require('../../middleware/auth.middleware');

router.get('/getAllRolepermisos', auth.auth, rolPermisoController.getAll);
router.post('/createRolpermiso', auth.auth, rolPermisoController.create);
router.delete('/deleteRolpermiso/:id', auth.auth, rolPermisoController.delete);
router.get('/getPermissionsByRoleId/:id', auth.auth, rolPermisoController.getPermissionsByRoleId);

module.exports = router;
