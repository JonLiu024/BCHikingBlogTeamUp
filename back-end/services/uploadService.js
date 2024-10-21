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

// Function to start a multipart upload
async function initiateMultipartUpload(bucketName, key) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  const response = await s3.createMultipartUpload(params).promise();
  return response.UploadId;
}

// Function to upload a part
async function uploadPart(bucketName, key, uploadId, partNumber, partData) {
  const params = {
    Bucket: bucketName,
    Key: key,
    PartNumber: partNumber,
    UploadId: uploadId,
    Body: partData,
  };
  const response = await s3.uploadPart(params).promise();
  return response.ETag;
}

// Function to handle the upload process, including resuming if needed
async function uploadFile(bucketName, key, fileBuffer) {
  const uploadId = await initiateMultipartUpload(bucketName, key);

  const partSize = 5 * 1024 * 1024; // 5 MB per part
  const totalParts = Math.ceil(fileBuffer.length / partSize);
  const completedParts = [];

  for (let i = 0; i < totalParts; i++) {
    const partNumber = i + 1;
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
      throw err; // If an error occurs, stop and handle it
    }
  }

  await completeMultipartUpload(bucketName, key, uploadId, completedParts);
  console.log("Multipart upload completed successfully.");
}

// Function to complete the multipart upload
async function completeMultipartUpload(
  bucketName,
  key,
  uploadId,
  completedParts
) {
  const params = {
    Bucket: bucketName,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: completedParts,
    },
  };
  await s3.completeMultipartUpload(params).promise();
}
