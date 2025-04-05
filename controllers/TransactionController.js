const express = require('express');
const Transactions = require('../models/Transactions');
const User = require('../models/User');
const { generateTransactionId } = require('../lib/common');
const { encrypt, decrypt } = require('../lib/utils/encryption');

const createTransaction = async (req, res) => {
    let success = false;
    const { encrypted } = req.body;
    const decryptedPayload = JSON.parse(decrypt(encrypted));
    const { receiverAccNum, amt, remarks, ifscCodeNumber, transactionTypeNm } = decryptedPayload;

    // Check if recieverAccNm is not user's own acc number
    const sender = await User.findById(req.user.id);
    let senderBalanceBefore = sender.accountDetails.balance;
    const transactionId = await generateTransactionId();

    if (receiverAccNum === sender.accountDetails.accountNumber) {
        return res.json({ success, message: 'Transaction error: The receiver account number cannot be the same as your own.' });
    }

    // After verifying check for recieverAccNm exist or not

    const receiver = await User.findOne({ 'accountDetails.accountNumber': receiverAccNum });

    if (!receiver) {
        return res.json({ success, message: 'Transaction error: Please enter valid receiver account number.' });
    }

    // Check if sender has sufficient balance
    if (sender.accountDetails.balance < amt) {
        return res.status(400).json({ success, message: 'Insufficient balance for this transaction.' });
    }

    // deducting sender balance
    const updatedSender = await User.findOneAndUpdate(
        { _id: sender.id },
        { $inc: { 'accountDetails.balance': -amt } },
        { new: true }
    );

    // Increment reciever balance
    await User.findOneAndUpdate(
        { 'accountDetails.accountNumber': receiverAccNum },
        { $inc: { 'accountDetails.balance': amt } },
        { new: true }
    );

    // Setting balance after of sender
    const senderBalanceAfter = updatedSender.accountDetails.balance;

    const transaction = await Transactions.create({
        transactionId,
        senderId: sender.id,
        ifscCodeNumber,
        receiverAccNum,
        receiverId: receiver.id,
        amt,
        currency: 'INR',
        transactionDate: new Date(),
        status: 'Success',
        remarks,
        transactionType: transactionTypeNm,
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderBalanceAfter,
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent'],
        auditInfo: {
            approvedBy: sender.id,
            approvedAt: Date.now(),
        },
        transactionReference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    success = true;
    const responsePayload = { success, message: "Transaction successful", details: transaction };
    const encryptedResponse = encrypt(JSON.stringify(responsePayload));
    res.status(200).json({ encrypted: encryptedResponse });
}

const fetchUserTransaction = async (req, res) => {
    let success = false;
    try {
        const userId = req.user.id;

        const transactions = await Transactions.find({ senderId: userId }).sort({ transactionDate: -1 });

        // If no transactions found
        if (!transactions || transactions.length === 0) {
            return res.status(200).json({ success, message: "No transactions found for the user." });
        }

        // Return transactions
        success = true;
        const responsePayload = { success: true, transactions };
        const encryptedResponse = encrypt(JSON.stringify(responsePayload));
        return res.status(200).json({ encrypted: encryptedResponse });
    } catch (error) {
        console.error("Error fetching user transactions:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



module.exports = {
    createTransaction,
    fetchUserTransaction
}