const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRoleMiddleware');


// Routes utilisateur
router.post('/', authenticate, alertController.createAlert);
router.get('/', authenticate, alertController.getAlerts);
router.put('/:id', authenticate, alertController.updateAlert);
router.get('/check', authenticate, alertController.checkAlerts);
router.get('/exceeded', authenticate, alertController.checkAlerts);

// Routes protégées par le rôle admin
router.delete('/:id', authenticate, checkRole("admin"), alertController.deleteAlert);


module.exports = router;
