const router = require('express').Router();
const rolController = require('../../controllers/rol.controller');
const auth = require('../../middleware/auth.middleware');

router.get('/getAllRoles', auth.auth, rolController.getAll);
router.get('/getByIdRol/:id', auth.auth, rolController.getById);
router.post('/createRol', auth.auth, rolController.create);
router.put('/updateRol/:id', auth.auth, rolController.update);
router.delete('/deleteRol/:id', auth.auth, rolController.delete);
router.put(
  '/updateRolWithPerms/:id',
  auth.auth,
  rolController.updateWithPermissions
);

module.exports = router;
