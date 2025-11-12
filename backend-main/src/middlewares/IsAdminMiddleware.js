// src/middlewares/isAdmin.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/SuperAdmin/Admin');

const isAdmin = async (req, res, next) => {
  try {
    // Check if the token is present in the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Token is missing' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).populate('roleId');
    if (!admin || admin.status !== 'Active') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (!admin.isSuperAdmin) {
      if (admin.roleId.name !== "admin") {
        return res
          .status(403)
          .json({ message: "You are not authorized as an Admin" });
      }
    }
    // Check if user has the Admin role
    

    req.user = admin; // Attach the admin info to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = isAdmin;
