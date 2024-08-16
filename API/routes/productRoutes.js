const express = require('express');
const productController = require('../controllers/productController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRoleMiddleware');

const router = express.Router();



// Routes utilisateur
router.get('/search', authenticate, productController.searchProducts);
router.get('/reference/:reference', authenticate, productController.getProductByReference);
router.get('/:id', authenticate, productController.getProductById);
router.get('/', authenticate, productController.getAllProducts);



// Routes protégées par le rôle admin
router.post('/', authenticate, checkRole('admin'), productController.addProduct);
router.put('/:id', authenticate, checkRole('admin'), productController.updateProduct);
router.delete('/:id', authenticate, checkRole('admin'), productController.deleteProduct);


module.exports = router;

