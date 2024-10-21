// awsConfig.js
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, //environment variables
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // environment variables
  region: "us-west-2",
});

const s3 = new AWS.S3();

module.exports = s3;
