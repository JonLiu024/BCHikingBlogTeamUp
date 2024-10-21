// uploadService.js
const s3 = require("./awsConfig");
const { v4: uuidv4 } = require("uuid");

// Function to upload a file to S3
const uploadFileToS3 = async (file) => {
  const fileKey = `${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey, // File name in S3
    Body: file.buffer, // File content
    ContentType: file.mimetype, // File MIME type
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Return the file URL
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw new Error("File upload failed");
  }
};

module.exports = uploadFileToS3;
