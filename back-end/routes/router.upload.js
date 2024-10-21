const express = require("express");
const multer = require("multer"); // Middleware for handling file uploads
const uploadFileToS3 = require("./uploadService");

const router = express.Router();
const upload = multer();

// Route for uploading a file
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = await uploadFileToS3(req.file); // Upload file to S3
    res.json({ message: "File uploaded successfully", fileUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload file" });
  }
});

module.exports = router;
