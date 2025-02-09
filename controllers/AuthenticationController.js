const express = require('express');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'UserIsValidated';
const User = require('../models/User');
const { generateAccountNumber, generateCrnNumber, generateIfscCode } = require('../lib/common');

const personalDetails = async (req, res) => {
    let success = false;

    // If there are errors, return bad request and the errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }


    try {
        const { personalDetails } = req.body;
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
        res.status(200).json({ success, message: "Successfully Save personal Details!", details: user });
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
        const { email, documentDetails } = req.body;

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
            res.status(200).json({
                success,
                message: "Successfully saved document details!",
                details: updatedUser.documentDetails
            });
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
        const { email, accountDetails } = req.body;
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
                    'accountDetails': accDetails,
                }
            },
            { new: true }
        );

        if (updatedUser) {
            let data = {
                user: {
                    id: updatedUser.id,
                },
                accountDetails: updatedUser.accountDetails,
            };

            let authtoken = jwt.sign(data, JWT_SECRET);

            return res.status(200).json({
                success: true,
                message: "Account created successfully!",
                authtoken,
                data: updatedUser,
            });
        } else {
            return res.status(500).json({ success: false, message: "Something went wrong while updating account!" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occurred.");
    }
};

// Login route
const login = async (req, res) => {
    let success = false;

    // If there are errors, return bad request and the errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const { username, password } = req.body;

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
        res.status(200).json({ success, message: "Login successfull !", authtoken, user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occurred.");
    }
};

module.exports = {
    personalDetails,
    documentDetails,
    accountDetails,
    login
}