const express = require('express');
const router = express.Router();
const categoriaController = require('../../controllers/categoria.controller');
const { auth, validarModulo, validarPermiso } = require('../../middleware/auth.middleware');

router.get('/getAllCategorias',auth, validarModulo('CATEGORIAS'), validarPermiso('CATEGORIA_READ'), categoriaController.getAll);
router.get('/getByIdCategoria/:id',auth, validarModulo('CATEGORIAS'), validarPermiso('CATEGORIA_READ'), categoriaController.getById);
router.post('/createCategoria',auth, validarModulo('CATEGORIAS'), validarPermiso('CATEGORIA_CREATE'), categoriaController.create);
router.put('/updateCategoria/:id',auth, validarModulo('CATEGORIAS'), validarPermiso('CATEGORIA_UPDATE'), categoriaController.update);
router.delete('/deleteCategoria/:id',auth, validarModulo('CATEGORIAS'), validarPermiso('CATEGORIA_DELETE'), categoriaController.delete);

module.exports = router;