const express = require('express');
const router = express.Router();
const upload = require('../upload');
const fs = require('fs');
const path = require('path');

// Route for handling file upload
router.post('/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      // Handle errors from Multer
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Check if the file was provided
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const uploadDir = path.join(__dirname, '../uploads');
    const uploadedFilePath = path.join(uploadDir, req.file.filename);

    // Return file details after successful upload
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: req.file,
    });
  });
});

module.exports = router;
