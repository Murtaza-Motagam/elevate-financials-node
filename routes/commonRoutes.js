const express = require("express");
const router = express.Router();
const upload = require("../upload");

router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      imageUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
});

module.exports = router;
