const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    personalDetails: {
        firstName: { type: String, },
        lastName: { type: String, },
        email: { type: String, required: true, lowercase: true },
        mobNo: { type: String, required: true },
        dob: { type: Date, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        alternateEmail: { type: String },
        alternateMobNo: { type: String },
        address: {
            street: { type: String, },
            city: { type: String, },
            state: { type: String, },
            postalCode: { type: String, }
        },
    },
    documentDetails: {
        aadharNo: { type: Number },
        panNo: { type: String },
        profileImg: { type: String },
        driverLicence: { type: Number },
        addressProof: {
            type: { type: String },
            image: { type: String },
        },
    },
    accountDetails: {
        accountNumber: { type: Number, },
        crnNumber: { type: Number },
        ifscCode: { type: String },
        accountType: {
            type: String,
            enum: ['Savings', 'Checking', 'Fixed Deposit'],
        },
        balance: { type: Number, default: 0 },
        suspensionReason: { type: String },
        accountActivationDate: { type: Date, default: Date.now },
        accountSuspensionDate: { type: Date },
        createdAt: { type: Date, default: Date.now },
    },
    authentication: {
        password: { type: String, },
        username: { type: String, },
        isActive: { type: Boolean, default: true },
        roles: {
            type: [String],
            default: ['User'],
        },
        permissions: [{
            type: String,
        }],
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'inactive'],
        default: 'active',
    },
    activityLogs: [{
        action: String,
        timestamp: { type: Date, default: Date.now },
    }],
    preferences: {
        notification: {
            emailNotifications: { type: Boolean, default: true },
            smsNotifications: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true },
        },
        language: { type: String, enum: ['en', 'es', 'fr', 'de'], default: 'en' },
    },
    security: {
        isVerified: { type: Boolean, default: false },
        failedLoginAttempts: { type: Number, default: 0 },
        lastLogin: { type: Date },
        twoFactorEnabled: { type: Boolean, default: false },
        securityQuestions: [{ question: String, answer: String }],
    },
    socialPreference: {
        socialMedia: {
            facebook: { type: String },
            twitter: { type: String },
            linkedin: { type: String },
        },
        thirdPartyAccounts: [{
            provider: { type: String }, // e.g., 'Google', 'Facebook', etc.
            accountId: { type: String },
        }],
    }
},
    {
        timestamps: true,
    });


module.exports = mongoose.model('User', UserSchema);
