const express = require('express');
const localisationController = require('../controllers/localisationController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRoleMiddleware');

const router = express.Router();

router.get('/', authenticate, localisationController.getAllLocalisations);
router.get('/:id', authenticate, localisationController.getLocalisationById);
router.get('/aisle/:aisleId', authenticate, localisationController.getAisleDetails);

// 
router.post('/', authenticate, checkRole('admin'), localisationController.createLocalisation);
router.put('/:id', authenticate, checkRole('admin'), localisationController.updateLocalisation);
router.delete('/:id', authenticate, checkRole('admin'), localisationController.deleteLocalisation);

module.exports = router;
