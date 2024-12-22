const Transactions = require('../models/Transactions');


// Function to generate a unique account number
const generateAccountNumber = () => {
    const fixedPart = '200010010';
    const randomPart = Math.floor(Math.random() * 1000);
    const accountNumber = fixedPart + randomPart.toString().padStart(3, '0');

    return accountNumber;
}

// Function to generate a unique CRN number
const generateCrnNumber = () => {
    const fixedPart = '4320';
    const randomPart = Math.floor(Math.random() * 10000);
    const crnNumber = fixedPart + randomPart.toString().padStart(4, '0');

    return crnNumber;
}

// Function to generate a unique ifsc code number
const generateIfscCode = () => {
    const fixedPart = 'ELFEE909';
    const randomPart = Math.floor(Math.random() * 10000);
    const ifscNumber = fixedPart + randomPart.toString().padStart(4, '0');

    return ifscNumber;
}

const generateTransactionId = async () => {
    let isUnique = false;
    let transactionId;

    while (!isUnique) {
        // Generate a random 6-digit number
        const randomNum = Math.floor(100000 + Math.random() * 900000); // Ensures a 6-digit number
        transactionId = `TR-${randomNum}`;

        // Check if the transaction ID already exists
        const existingTransaction = await Transactions.findOne({ transactionId });
        if (!existingTransaction) {
            isUnique = true;
        }
    }

    return transactionId;
};


module.exports = { generateAccountNumber, generateCrnNumber, generateIfscCode, generateTransactionId }