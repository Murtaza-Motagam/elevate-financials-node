const { monthNames } = require('../lib/constant');
const Transactions = require('../models/Transactions');
const User = require('../models/User');

/**
 * Get transaction count by month
 * @returns {Promise<Array>} - Returns an array of objects with month names and transaction counts
 */
const getTransactionsByMonth = async () => {
    try {
        const transactionsByMonth = await Transactions.aggregate([
            {
                $match: { status: 'Success' } // Only count successful transactions
            },
            {
                $group: {
                    _id: { $month: "$transactionDate" }, // Group by month
                    totalTransactions: { $sum: 1 } // Count the number of transactions
                }
            },
            {
                $sort: { _id: 1 } // Sort by month in ascending order
            }
        ]);

        return monthNames.map((month, index) => {
            const monthData = transactionsByMonth.find(item => item._id === index + 1);
            return {
                name: month,
                transactions: monthData ? monthData.totalTransactions : 0
            };
        });

    } catch (error) {
        console.error("Error fetching transaction data by month:", error);
        throw error;
    }
};

const getLatestTransactions = async () => {
    try {
        // Fetch latest 4 transactions
        const latestTransactions = await Transactions.find({ status: 'Success' })
            .sort({ transactionDate: -1 })
            .limit(4);

        // Extract receiver account numbers from transactions
        const receiverAccNums = latestTransactions.map(txn => txn.receiverAccNum);

        // Fetch user details for these account numbers
        const users = await User.find({ "accountDetails.accountNumber": { $in: receiverAccNums } })
            .select("personalDetails.firstName personalDetails.lastName documentDetails.profileImg accountDetails.accountType accountDetails.accountNumber");

        // Map user data to transactions
        const latestTransactionDetails = latestTransactions.map(txn => {
            const user = users.find(u => u.accountDetails.accountNumber === txn.receiverAccNum);

            return {
                name: user ? `${user.personalDetails.firstName} ${user.personalDetails.lastName}` : "Anonymous user",
                profileImg: user ? user.documentDetails.profileImg : null,
                accountType: user ? `[ ${user.accountDetails.accountType} A/C]` : "Unknown",
                amt: txn.amt // Transaction amount
            };
        });

        return latestTransactionDetails;

    } catch (error) {
        console.error("Error fetching latest transactions:", error);
        throw error;
    }
};

module.exports = {
    getTransactionsByMonth,
    getLatestTransactions
};
