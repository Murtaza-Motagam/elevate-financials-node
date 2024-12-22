const express = require('express');
const User = require('../models/User');

const getUser = async (req, res) => {
    let success = false;
    try {
        let userId = req.user.id;
        const details = await User.findById(userId).select("-authentication.password");

        success = true;
        res.json({ success, details });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const updateProfile = async (req, res) => {
    let success = false;
    try {
        // const { profileImg, }
        const details = await User.findById(userId).select("-authentication.password");

        success = true;
        res.json({ success, details });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    getUser,
    updateProfile,
}