const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');


const router = express.Router();

// Generic login for any role
router.post('/login', authController.login);
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;
