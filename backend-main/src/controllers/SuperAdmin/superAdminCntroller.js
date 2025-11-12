const Admin = require('../../models/SuperAdmin/Admin');
const Role = require('../../models/Role');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendResetEmail } = require('../../utils/mailService');
const AdminService = require('../../service/superAdminService');
const Hotel = require('../../models/Hotel');
const ApiError = require('../../utils/ApiError');

// Login for Super Admin and Hotel Admin (same endpoint)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email and Password are required');
    }
    const user = await Admin.findOne({ email: email.toLowerCase().trim() }).populate("roleId");
    if (!user) {
      throw new ApiError(401, 'User Not Found with this email');

    }
    if (!user || !(bcrypt.compare(password, user.password))) {
      throw new ApiError(401, 'Invalid credentials');
    }
    if (user.status !== 'Active') {
      throw new ApiError(403, 'Your User Account is not Active.');
    }
    if (user.scope === 'Hotel') {
      const hotel = await Hotel.findById(user.HotelId)
      if (!hotel) {
        throw new ApiError(404, 'Hotel Not Found associated with this Admin!');
      }
      if (hotel.status !== 'Active') {
        throw new ApiError(403, 'Your Hotel is not Active. Contact Support!');
      }
      if (new Date(hotel.subscriptionEndDate) <= new Date()) {
        throw new ApiError(403, 'Hotel Subscription Expired! Contact Us!');
      }

      if (new Date(hotel.subscriptionStartDate) > new Date()) {
        throw new ApiError(403, 'Hotel Subscription not Started Yet! Contact Us!');
      }
      if (hotel.subscriptionStatus !== 'Active') {
        throw new ApiError(403, 'Hotel Subscription is not Active! Contact Us!');
      }
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.roleId.name,
        permissions: user.isSuperAdmin || user.roleId.name === 'admin' ? ["all"] : user.roleId.permissions,
        scope: user.scope,
        HotelId: user.HotelId ? user.HotelId : null,
        userType: 'Admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      status: true,
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.roleId.name,
        scope: user.scope,
        HotelId: user.HotelId,
        isSuperAdmin: user.isSuperAdmin,
        permissions:
          user.isSuperAdmin || user.roleId.name === "admin"
            ? ["all"]
            : user.roleId.permissions,
      },
    });
  } catch (error) {
    return next(error);
  }
};


// Create Super Admin (special role)
exports.createSuperAdmin = async (req, res) => {
  const { firstName, lastName, email, password, mobileNumber } = req.body;

  try {
    // Check if a Super Admin already exists
    const existingSuperAdmin = await Admin.findOne({ isSuperAdmin: true });
    if (existingSuperAdmin) {
      return res.status(400).json({ status: false, message: 'A Super Admin already exists.' });
    }

    const superAdmin = new Admin({
      firstName,
      lastName,
      email,
      password,
      roleId: "680c81aefd925131060584ba", // Hardcoded Super Admin Role ID
      status: "Active",
      isSuperAdmin: true,
      scope: "Platform",
      mobileNumber,
    });

    await superAdmin.save();

    return res.status(201).json({
      status: true,
      message: 'Super Admin created successfully.',
      superAdmin: {
        id: superAdmin._id,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        email: superAdmin.email,
        roleId: superAdmin.roleId,
      },
    });
  } catch (error) {
    console.error('Error creating Super Admin:', error);
    return res.status(500).json({ status: false, message: 'Error creating Super Admin', error: error.message });
  }
};

// Update Admin
exports.updateAdmin = async (req, res) => {
  const { adminId } = req.params;
  const { firstName, lastName, email, roleId, status } = req.body;

  try {
    // Find the admin by ID and populate the roleId field
    const admin = await Admin.findById(adminId).populate('roleId');
    if (!admin) {
      return res.status(404).json({ status: false, message: 'Admin not found' });
    }

    // Check for email uniqueness
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ status: false, message: 'Email is already in use by another admin' });
      }
    }

    // Prevent updating roleId to Super Admin
    if (roleId) {
      const role = await Role.findById(roleId);
      if (role.name === 'Super Admin') {
        return res.status(400).json({ status: false, message: 'You cannot assign the role of Super Admin' });
      }
    }

    // Update admin details
    admin.firstName = firstName || admin.firstName;
    admin.lastName = lastName || admin.lastName;
    admin.email = email || admin.email;
    admin.roleId = roleId || admin.roleId;
    admin.status = status || admin.status;

    await admin.save();

    return res.status(200).json({
      status: true,
      message: 'Admin updated successfully',
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.roleId.name,
        status: admin.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error updating admin', error: error.message });
  }
};

// Deactivate Admin
exports.deactivateAdmin = async (req, res) => {
  const { adminId } = req.params;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ status: false, message: 'Admin not found' });
    }

    admin.status = 'Inactive';
    await admin.save();

    return res.status(200).json({
      status: true,
      message: 'Admin marked as inactive',
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        status: admin.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error deactivating admin', error: error.message });
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password'); // Exclude password from the response
    return res.status(200).json({
      status: true,
      admins: admins,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error fetching Admins', error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user)
      throw new ApiError(404, 'User Not Found with this email');
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = Date.now() + 180000; // OTP expires in 3 Mins
    user.IsOtpVerified = false; // OTP initially not verified
    await user.save();

    // Send OTP via email
    await sendResetEmail(email, otp);

    return res.status(200).json({
      status: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    return next(error);
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });

    if (user.passwordResetOTP !== otp || user.passwordResetOTPExpires < Date.now()) {
      return res.status(400).json({ status: false, message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    user.IsOtpVerified = true;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    return res.status(200).json({
      status: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error verifying OTP', error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });

    if (!user.IsOtpVerified) {
      return res.status(400).json({ status: false, message: 'OTP not verified' });
    }

    user.password = newPassword; // Update password (hashing will be done in the pre-save hook)

    user.passwordResetOTP = undefined;
    user.IsOtpVerified = false;
    user.passwordResetOTPExpires = undefined;

    await user.save();

    return res.status(200).json({
      status: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error resetting password', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await Admin.findById(req.user.id);
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ status: false, message: "Old password is incorrect" });

    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json({ status: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
