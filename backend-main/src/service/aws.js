const { s3, bucketName } = require('../config/aws');

const uploadImageToS3 = async (file, Key) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Upload parameters for S3
    const params = {
      Bucket: bucketName,
      Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    // Upload the file to S3
    const result = await s3.upload(params).promise();

    return {
      success: true,
      url: result.Location,
      Key,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

module.exports = {  uploadImageToS3 }