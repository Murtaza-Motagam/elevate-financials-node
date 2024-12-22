const express = require('express');
const router = express.Router();
const AuthenticationController = require('../controllers/AuthenticationController')

// Register routes
router.post('/save-personal-details', AuthenticationController.personalDetails)
router.post('/save-document-details', AuthenticationController.documentDetails)
router.post('/save-banking-details', AuthenticationController.accountDetails)

// Login route
router.post('/login', AuthenticationController.login)

module.exports = router;