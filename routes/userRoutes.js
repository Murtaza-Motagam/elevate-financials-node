const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const fetchUser = require('../middlewares/fetchUser');

// user detail fetch
router.get('/get-user', fetchUser, UserController.getUser);
router.get('/update-profile', fetchUser, UserController.updateProfile);

module.exports = router;