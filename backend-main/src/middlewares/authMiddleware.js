// File: src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/SuperAdmin/Admin');
const Guest = require("../models/Guest");
const Hotel = require('../models/Hotel');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
  exports.validateToken = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header
      if (!token) {
        return res.status(403).json({ message: 'Token is missing' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id).populate({
        path: 'roleId', // Populate the 'roleId' to get the role details
        select: 'permissions', // Only select the permissions field
      });

      if (!admin || admin.status !== 'Active') {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (admin.scope === 'Hotel') {
        const hotel = await Hotel.findById(admin.HotelId)
        if (!hotel) { 
          return res.status(403).json({message: "Access Denied! Hotel Not Found!"})
        }
        if (hotel.status !== 'Active') {
          return res.status(403).json({message:"Hotel Status Inactive! Contact Support!"})
        }
      }
      req.user = admin; // Attach user info and permissions to `req.user`
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    }
    console.error("Token validation error:", error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
exports.guestAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const guest = await Guest.findById(decoded.id).lean();
    if (!guest) return res.status(401).json({ message: "Invalid token" });

    req.guest = guest;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized", error: e.message });
  }
};