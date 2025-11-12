const Admin = require('../models/SuperAdmin/Admin');
const bcrypt = require('bcrypt');
const Role = require('../models/Role');

// Service to create Admin
exports.createAdmin = async (
  { firstName, lastName, email, password, roleId, permissions, scope },
  options = {}
) => {
  try {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }
    // Check if Admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw new Error("Admin with this email already exists");
    }

    const newAdmin = new Admin({
      firstName,
      lastName,
      email:email.toLowerCase(),
      password,
      roleId,
      permissions,
      status: "Active",
      scope,
    });

    await newAdmin.save(options);
    return newAdmin;
  } catch (error) {
    throw new Error(`Error creating admin: ${error.message}`);
  }
};
