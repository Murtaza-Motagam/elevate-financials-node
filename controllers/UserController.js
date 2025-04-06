const { addEncryption, removeDecryption } = require('../lib/common');
const User = require('../models/User');
const { getTransactionsByMonth, getLatestTransactions, getTransactionCountByType } = require('../services/TransactionService');

const getUser = async (req, res) => {
    let success = false;

    try {
        let userId = req.user.id;
        const details = await User.findById(userId).select("-authentication.password");

        success = true;
        const responsePayload = { success, details };
        const encryptedResponse = addEncryption(responsePayload);
        res.json({ encrypted: encryptedResponse });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const updateProfile = async (req, res) => {
    let success = false;
    const userId = req.user.id;
    const decryptedPayload = removeDecryption(req.body.encrypted);
    const { profileImg, username, accountType } = decryptedPayload;

    try {
        // Check if the user exists
        const user = await User.findById(userId).select("-authentication.password");

        if (!user) {
            return res.status(404).json({ success, message: 'No account found!' });
        }

        // Update the user profile correctly
        const updateUser = await User.findOneAndUpdate(
            { _id: userId }, // Filter condition
            {
                $set: {
                    "documentDetails.profileImg": profileImg,
                    "authentication.username": username,
                    "accountDetails.accountType": accountType
                }
            },
            { new: true } // Return updated document
        );

        if (!updateUser) {
            return res.status(400).json({ success, message: "Profile update failed" });
        }

        success = true;
        const responsePayload = { success, message: 'Profile updated successfully', user: updateUser };
        const encryptedResponse = addEncryption(responsePayload);
        return res.status(200).json({ encrypted: encryptedResponse });

    } catch (error) {
        console.error("Error updating profile:", error.message);
        res.status(500).json({ success, message: "Internal Server Error" });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const transactionHistory = await getTransactionsByMonth(req.user.id);
        const latestTransactions = await getLatestTransactions(req.user.id);
        const transactionType = await getTransactionCountByType(req.user.id);

        const responsePayload = {
            success: true,
            data: {
                transactionHistory,
                latestTransactions,
                transactionType
            }
        };
        const encryptedResponse = addEncryption(responsePayload);
        res.status(200).json({ encrypted: encryptedResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};

module.exports = {
    getUser,
    updateProfile,
    getAnalytics
}