const { monthNames } = require('../lib/constant');
const Transactions = require('../models/Transactions');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Get transaction count by month
 * @returns {Promise<Array>} - Returns an array of objects with month names and transaction counts
 */
const getTransactionsByMonth = async (userId) => {
    try {
        const transactionsByMonth = await Transactions.aggregate([
            {
                $match: {
                    status: 'Success',
                    senderId: new mongoose.Types.ObjectId(userId) // Filter by userId
                }
            },
            {
                $group: {
                    _id: { $month: "$transactionDate" }, // Group by month
                    totalAmount: { $sum: "$amt" }, // Sum of transaction amounts
                    balances: { $push: { balanceAfter: "$balanceAfter", date: "$transactionDate" } } // Store balance history
                }
            },
            {
                $project: {
                    _id: 1,
                    totalAmount: 1,
                    // Sort balances by date and pick last balance of the month
                    totalBalance: { $last: { $sortArray: { input: "$balances", sortBy: { date: 1 } } } }
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
                totalAmount: monthData ? monthData.totalAmount : 0,
                totalBalance: monthData && monthData.totalBalance ? monthData.totalBalance.balanceAfter : 0
            };
        });

    } catch (error) {
        console.error("Error fetching transaction data by month:", error);
        throw error;
    }
};

const getLatestTransactions = async (userId) => {
    try {
        // Fetch latest transactions of a specific user (senderId = userId)
        const latestTransactions = await Transactions.find({
            senderId: new mongoose.Types.ObjectId(userId),
            status: 'Success'
        })
            .sort({ transactionDate: -1 }) // Sort by latest transactions
            .limit(4); // Fetch max 4 transactions

        // If no transactions found, return an empty array
        if (latestTransactions.length === 0) {
            return [];
        }

        // Extract receiver account numbers from transactions
        const receiverAccNums = latestTransactions.map(txn => txn.receiverAccNum);

        // Fetch user details for these receiver accounts
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

const getTransactionCountByType = async (userId) => {
    const transactions = await Transactions.find({ senderId: userId, status: "Success" }).limit(5);
    console.log("Filtered Transactions:", transactions);

    try {
        const transactionCounts = await Transactions.aggregate([
            {
                $match: {
                    senderId: new mongoose.Types.ObjectId(userId), // Directly match the string userId
                    status: "Success", // Only successful transactions
                    transactionType: { $in: ["IMPS", "RTGS", "NEFT"] } // Filter only these types
                }
            },
            {
                $group: {
                    _id: "$transactionType", // Group by type
                    totalTransactions: { $sum: 1 } // Count transactions
                }
            }
        ]);

        // Default structure for missing transaction types
        const type = { IMPS: 0, RTGS: 0, NEFT: 0 };

        // Populate the result with actual data
        transactionCounts.forEach(item => {
            type[item._id] = item.totalTransactions;
        });

        const result = [
            { name: 'IMPS', value: type.IMPS },
            { name: 'RTGS', value: type.RTGS },
            { name: 'NEFT', value: type.NEFT },
        ]
        return result;
    } catch (error) {
        console.error("Error fetching transaction count by type:", error);
        throw error;
    }
};



module.exports = {
    getTransactionsByMonth,
    getLatestTransactions,
    getTransactionCountByType
};
