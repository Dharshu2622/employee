const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Access control could be added here (e.g., requireAdmin)
// For now, assuming auth middleware is handled globally or not strictly required for this step's demo

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/upload-logo', settingsController.uploadLogo);

module.exports = router;
