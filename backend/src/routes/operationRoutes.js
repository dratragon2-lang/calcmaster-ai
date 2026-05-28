const express = require('express');
const router = express.Router();
const operationController = require('../controllers/operationController');
const authenticateToken = require('../middlewares/authMiddleware');

// All routes here require authentication
router.use(authenticateToken);

router.post('/', operationController.saveOperation);
router.get('/', operationController.getHistory);
router.delete('/:id', operationController.deleteOperation);
router.delete('/', operationController.clearHistory);

module.exports = router;
