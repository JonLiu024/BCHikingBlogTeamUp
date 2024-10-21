const express = require("express");
const multer = require("multer"); // Middleware for handling file uploads
const uploadFileToS3 = require("./uploadService");

const router = express.Router();
const upload = multer();

// Route for uploading a file
router.post("/blog/upload", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = await uploadFileToS3(req.file); // Upload file to S3
    res.json({ message: "File uploaded successfully", fileUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Function to list already uploaded parts
async function listUploadedParts(bucketName, key, uploadId) {
  const params = {
    Bucket: bucketName,
    Key: key,
    UploadId: uploadId,
  };
  const response = await s3.listParts(params).promise();
  return response.Parts.map((part) => ({
    PartNumber: part.PartNumber,
    ETag: part.ETag,
  }));
}

// Resume uploading remaining parts if the upload was interrupted
async function resumeMultipartUpload(bucketName, key, fileBuffer, uploadId) {
  const uploadedParts = await listUploadedParts(bucketName, key, uploadId);
  const uploadedPartNumbers = uploadedParts.map((part) => part.PartNumber);

  const partSize = 5 * 1024 * 1024; // 5 MB per part
  const totalParts = Math.ceil(fileBuffer.length / partSize);
  const completedParts = [...uploadedParts]; // Start with already uploaded parts

  for (let i = 0; i < totalParts; i++) {
    const partNumber = i + 1;
    if (uploadedPartNumbers.includes(partNumber)) {
      continue; // Skip parts that are already uploaded
    }

    const partData = fileBuffer.slice(i * partSize, (i + 1) * partSize);
    try {
      const ETag = await uploadPart(
        bucketName,
        key,
        uploadId,
        partNumber,
        partData
      );
      completedParts.push({ PartNumber: partNumber, ETag });
    } catch (err) {
      console.error(`Error uploading part ${partNumber}:`, err);
      throw err; // Stop on error
    }
  }

  await completeMultipartUpload(bucketName, key, uploadId, completedParts);
  console.log("Resumed and completed the multipart upload successfully.");
}

module.exports = router;
