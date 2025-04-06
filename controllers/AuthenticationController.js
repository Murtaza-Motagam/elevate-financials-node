const express = require('express');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'UserIsValidated';
const User = require('../models/User');
const { generateAccountNumber, generateCrnNumber, generateIfscCode, generateOtp } = require('../lib/common');
const { encrypt, decrypt } = require('../lib/utils/encryption');

const personalDetails = async (req, res) => {
    let success = false;

    // If there are errors, return bad request and the errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }


    try {
        const { encrypted } = req.body;
        const decryptedPayload = JSON.parse(decrypt(encrypted));
        const { personalDetails } = decryptedPayload
        const { firstName, lastName, gender, dob, email, mobNo } = personalDetails;

        // Find user by email
        let user = await User.findOne({ 'personalDetails.email': email });
        let mobileNum = await User.findOne({ 'personalDetails.mobNo': mobNo });

        if (user) {
            return res.status(200).json({
                success: false,
                message: "Sorry, an email with this name already exists. Try using a different one."
            });
        }

        if (mobileNum) {
            return res.status(200).json({
                success: false,
                message: "Sorry, this mobile number already exists. Try using a different one."
            });
        }

        user = await User.create({
            personalDetails: {
                firstName,
                lastName,
                email,
                mobNo,
                gender,
                dob,
            }
        });

        success = true;
        const responsePayload = {
            success: true,
            message: "Successfully Save personal Details!",
            details: user,
        };

        const encryptedResponse = encrypt(JSON.stringify(responsePayload));
        res.status(200).json({ encrypted: encryptedResponse });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occurred.");
    }
};

const documentDetails = async (req, res) => {
    let success = false;

    // If there are errors, return bad request and the errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const { encrypted } = req.body;
        const decryptedPayload = JSON.parse(decrypt(encrypted));
        const { email, documentDetails } = decryptedPayload;

        // Find user by email
        let document = await User.findOne({ 'personalDetails.email': email });

        if (!document) {
            return res.status(400).json({
                success: false,
                message: "Sorry user not found!"
            });
        }

        // Update the user's documentDetails field
        const updatedUser = await User.findOneAndUpdate(
            { 'personalDetails.email': email },
            { $set: { documentDetails } }, // Update documentDetails
            { new: true } // Return the updated document
        );

        if (updatedUser) {
            success = true;
            const responsePayload = {
                success,
                message: "Successfully saved document details!",
                details: updatedUser.documentDetails
            }
            const encryptedResponse = encrypt(JSON.stringify(responsePayload));
            res.status(200).json({ encrypted: encryptedResponse });
        } else {
            res.status(500).json({ success, message: "Sorry something went wrong!" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occurred.");
    }
};

const accountDetails = async (req, res) => {
    let success = false;

    // If there are errors, return bad request and the errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const { encrypted } = req.body;
        const decryptedPayload = JSON.parse(decrypt(encrypted));
        const { email, accountDetails } = decryptedPayload;
        const { username, password, accountType } = accountDetails;

        // Find user by email
        let document = await User.findOne({ 'personalDetails.email': email });

        if (!document) {
            return res.status(200).json({
                success: false,
                message: "Sorry user not found!"
            });
        }

        const accountNm = generateAccountNumber();
        const crnNm = generateCrnNumber();
        const ifscCode = generateIfscCode();
        const otp = generateOtp();

        // Hashing password
        let salt = await bcrypt.genSalt(10);
        let secPass = await bcrypt.hash(password, salt);

        const accDetails = {
            accountNumber: accountNm,
            crnNumber: crnNm,
            ifscCode: ifscCode,
            balance: 89000,
            accountType,
        }

        const updatedUser = await User.findOneAndUpdate(
            { 'personalDetails.email': email },
            {
                $set: {
                    'authentication.username': username,
                    'authentication.password': secPass,
                    'authentication.otp': otp,
                    'accountDetails': accDetails,
                }
            },
            { new: true }
        );

        if (updatedUser) {
            success = true;
            const responsePayload = {
                success,
                message: "Account created successfully!",
                data: updatedUser,
            }
            const encryptedResponse = encrypt(JSON.stringify(responsePayload));
            return res.status(200).json({ encrypted: encryptedResponse });
        } else {
            return res.status(500).json({ success: false, message: "Something went wrong while updating account!" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occurred.");
    }
};

const otpVerify = async (req, res) => {
    let success = false;

    const { encrypted } = req.body;
    const decryptedPayload = JSON.parse(decrypt(encrypted));
    const { email, otpNumber } = decryptedPayload;

    // Find user by email
    let user = await User.findOneAndUpdate({ 'personalDetails.email': email });

    if (!user) {
        return res.status(200).json({
            success: false,
            message: "Sorry user not found!"
        });
    }

    if (user.authentication.otp == otpNumber) {
        user.authentication.isVerified = true;
        await user.save();

        const data = {
            user: {
                id: user._id,
            },
        };

        let authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        const responsePayload = {
            success,
            message: "You have been successfully verified.",
            authtoken,
            data: user,
        }
        const encryptedResponse = encrypt(JSON.stringify(responsePayload));
        return res.status(200).json({ encrypted: encryptedResponse });
    } else {
        return res.status(200).json({
            success,
            message: "The OTP you entered is incorrect. Please try again.",
        });
    }
}


// Login route
const login = async (req, res) => {
    let success = false;

    // If there are errors, return bad request and the errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const { encrypted } = req.body;
        const decryptedPayload = JSON.parse(decrypt(encrypted));
        const { username, password } = decryptedPayload

        const isNumeric = !isNaN(username);

        const query = isNumeric
            ? { 'accountDetails.crnNumber': Number(username) }
            : { 'authentication.username': username };


        const user = await User.findOne(query);

        if (!user) {
            return res.status(200).json({
                success: false,
                message: "Wrong Credentials, Try using proper credentials."
            });
        }

        const passwordCompare = await bcrypt.compare(password, user.authentication?.password);

        if (!passwordCompare) {
            return res.status(200).json({ success, message: "Please try to login with proper credentials." });
        }

        let data = {
            user: {
                id: user.id
            }
        };

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        const responsePayload = { success, message: "Login successfull !", authtoken, user };
        const encryptedResponse = encrypt(JSON.stringify(responsePayload));
        res.status(200).json({ encrypted: encryptedResponse });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occurred.");
    }
};

module.exports = {
    personalDetails,
    documentDetails,
    accountDetails,
    otpVerify,
    login
}