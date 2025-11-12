// src/middlewares/isSuperAdmin.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/SuperAdmin/Admin');

const isSuperAdmin = async (req, res, next) => {
  try {
    // Check if the token is present in the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Token is missing' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin || admin.status !== 'Active') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user has the Super Admin role
    if (!admin.isSuperAdmin) {
      return res.status(403).json({ message: 'You are not authorized as a Super Admin' });
    }

    req.user = admin; // Attach the admin info to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {isSuperAdmin};
