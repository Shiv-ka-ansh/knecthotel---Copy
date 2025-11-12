const express = require('express');
const router = express.Router();
const { createSuperAdmin, getAllAdmins, updateAdmin, deactivateAdmin, login, verifyOtp, resetPassword, forgotPassword, changePassword } = require('../../controllers/SuperAdmin/superAdminCntroller');
const { isSuperAdmin } = require('../../middlewares/IsSuperAdminMiddleware');
const { verifyToken } = require('../../middlewares/authMiddleware');

router.post('/create-super', createSuperAdmin);

router.post('/login',login)


// Get all Admins (only accessible by Super Admin)
router.get('/admins', isSuperAdmin, getAllAdmins);

// Update Admin Info and Permissions (only accessible by Super Admin)
router.put('/admins/:adminId', isSuperAdmin, updateAdmin);

// Mark Admin as Deactivated (only accessible by Super Admin)
router.put('/admins/:adminId/deactivate', isSuperAdmin, deactivateAdmin);

router.post('/send-reset-otp', forgotPassword); 
// Send OTP for password reset (only accessible by Super Admin)

router.post('/verify-otp', verifyOtp); 
// Verify OTP (only accessible by Super Admin)      

router.post('/reset-password', resetPassword); 
// Reset Password (only accessible by Super Admin)

router.post("/change-password", verifyToken, changePassword);
module.exports = router;
