
const { body, validationResult } = require('express-validator');

// Forgot password validation
const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
];

// Verify OTP and reset password validation
const verifyOtpAndResetPasswordValidator = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits long'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

// Create admin validation
const createAdminValidator = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role').isIn(['admin', 'superadmin']).withMessage('Role must be either "admin" or "superadmin"'),
];

// General validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: 'Validation errors',
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  forgotPasswordValidator,
  verifyOtpAndResetPasswordValidator,
  createAdminValidator,
  validate,
};
