const { uploadImageToS3 } = require("../../service/aws");
const ApiError = require("../../utils/ApiError");
const { verifyAadhaar } = require("../../utils/cashfreeServices");
const generateUniqueId = require("../../utils/idGenerator");
const  Verification  = require("../../models/Verification");

const uploadDocument = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    let filename
    if (req.user) {
      filename = `${req.user.scope}/${Date.now()}_${file.originalname}`;
      
    }else if (req.guest) {
      filename = `guests/${Date.now()}_${file.originalname}`;
    }
    
    const uploadResult = await uploadImageToS3(file, filename);

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: uploadResult,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to upload document" });
  }
};
const uploadDocuments = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    // Process each file
    const uploadResults = [];
    const urls = [];

    for (const file of files) {
      let filename;

      if (req.user) {
        filename = `${req.user.scope}/${Date.now()}_${file.originalname}`;
      } else if (req.guest) {
        filename = `guests/${Date.now()}_${file.originalname}`;
      }

      const uploadResult = await uploadImageToS3(file, filename); // Assuming your uploadImageToS3 handles the file upload
      
      urls.push(uploadResult.url);
      uploadResults.push(uploadResult);
    }

    res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      urls,
      data: uploadResults,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ success: false, message: "Failed to upload documents" });
  }
};

const verifyAadhaarC = async (req, res, next) => {
  try {
    const file = req.file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "no_file",
        message:
          'No file uploaded. Please attach your Aadhaar file under field name "file".',
      });
    }
    
    const document_type = "AADHAAR";

    const verification_id = await generateUniqueId('Verification', 'uniqueId', 'VER')
    
    const response = await verifyAadhaar(verification_id, document_type, req.file)
    let filename = `guests/${Date.now()}_${file.originalname}`;
    const uploadResult = await uploadImageToS3(file, filename);
    const verification = new Verification({
      uniqueId: verification_id,
      status: response.status,
      document_type: response.document_type,
      s3Key: uploadResult.Key,  
      s3Url: uploadResult.url
    });
    await verification.save()
    return res.status(200).json({message:'Verification', response, data:uploadResult})
  } catch (e) {
    console.log(e)
    let statusCode = 500
    if (typeof e?.response?.status === "number") statusCode = e.response.status;
    res
    .status(statusCode)
    .json({ success: false, message: "Failed to verify document", error:e?.response?.data?.message });
  }
};

module.exports = { uploadDocument, verifyAadhaarC, uploadDocuments };
