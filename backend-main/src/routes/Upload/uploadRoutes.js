const express = require('express')
const { guestAuth, validateToken } = require('../../middlewares/authMiddleware')
const {
  uploadDocument,
  verifyAadhaarC,
  uploadDocuments,
} = require("../../controllers/Upload/uploadDocument");
const multer = require("multer");

const storage = multer.memoryStorage();  
const upload = multer({ storage });
const uploadForVerification = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    // Optionally check mimetype if you only accept certain types, e.g. PDF or image:
    if (file.mimetype !== 'application/pdf' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only PDF/image allowed'));
    }
    cb(null, true);
  },
});

const router = express.Router()

router.post("/guest",upload.single('file'), guestAuth, uploadDocument)

router.post("/admin", upload.single("file"),  validateToken, uploadDocument);

router.post("/admin/multiple", upload.array("files", 15), validateToken, uploadDocuments);

router.post(
  "/verify-aadhaar",
  uploadForVerification.single("file"),
  verifyAadhaarC
);

module.exports = router