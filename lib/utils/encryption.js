// utils/encryption.js
const crypto = require('crypto');

// AES Configuration
const algorithm = 'aes-256-cbc';
const IV_LENGTH = 16; // AES uses a 16-byte IV
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Must be 32 bytes

if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('Invalid ENCRYPTION_KEY length. Must be 64 hex characters representing 32 bytes.');
}

/**
 * Encrypts a string using AES-256-CBC
 * @param {string} text - The plain text to encrypt
 * @returns {string} Encrypted string in the format: iv:encryptedData
 */
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

/**
 * Decrypts an encrypted string back to plain text
 * @param {string} encrypted - Encrypted string in the format: iv:encryptedData
 * @returns {string} Decrypted plain text
 */
const decrypt = (encrypted) => {
    const [ivHex, encryptedHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

module.exports = {
    encrypt,
    decrypt,
};
