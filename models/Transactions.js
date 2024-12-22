const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        transactionId: {
            type: String,
            required: true,
        },
        ifscCodeNumber: {
            type: String,
        },
        receiverAccNum: {
            type: Number,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        amt: {
            type: Number,
        },
        currency: {
            type: String,
            default: 'INR'
        },
        transactionDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['Pending', 'Success', 'Failed'],
            default: 'Pending',
        },
        remarks: {
            type: String,
            default: ''
        },
        transactionType: {
            type: String,
        },
        transactionFee: {
            type: Number,
            default: 0
        },
        balanceBefore: {
            type: Number,
        },
        balanceAfter: {
            type: Number,
        },
        ipAddress: {
            type: String,
        },
        deviceInfo: {
            type: String,
            default: ''
        },
        auditInfo: {
            approvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            approvedAt: {
                type: Date,
                default: null
            }
        },
        transactionReference: {
            type: String,
            unique: true, // Ensure uniqueness
            required: true, // Ensure it cannot be null
        }
    },
    { timestamps: true }
);

transactionSchema.pre('save', function (next) {
    if (!this.transactionReference) {
        this.transactionReference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

const Transactions = mongoose.model('Transactions', transactionSchema);

module.exports = Transactions;
