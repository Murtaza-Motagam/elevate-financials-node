const express = require('express');
const router = express.Router();
const fetchUser = require('../middlewares/fetchUser');
const transactionController = require('../controllers/TransactionController');

// user detail fetch
router.post('/create-transaction', fetchUser, transactionController.createTransaction);
router.get('/get-transaction', fetchUser, transactionController.fetchUserTransaction);

module.exports = router;