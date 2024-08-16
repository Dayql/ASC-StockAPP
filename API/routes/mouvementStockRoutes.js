const express = require('express');
const mouvementStockController = require('../controllers/mouvementStockController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRoleMiddleware');

const router = express.Router();

// Routes utilisateur
router.get('/:id', authenticate, mouvementStockController.getMouvementStockById);
router.get('/', authenticate, mouvementStockController.getAllMouvementStock);
router.get('/product/:productId', authenticate, mouvementStockController.getMovementsByProduct);
router.post('/product/:productId', authenticate, mouvementStockController.addMouvementStock);
router.put('/:id', authenticate, mouvementStockController.updateMouvementStock);

// Routes protégées par le rôle admin
router.delete('/:id', authenticate, checkRole('admin'), mouvementStockController.deleteMovement);




module.exports = router;
