const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const fetchUser = require('../middlewares/fetchUser');

// user detail fetch
router.get('/get-user', fetchUser, UserController.getUser);
router.put('/update-profile', fetchUser, UserController.updateProfile);

// Analytics route
router.get('/get-analytics', fetchUser, UserController.getAnalytics);

module.exports = router;