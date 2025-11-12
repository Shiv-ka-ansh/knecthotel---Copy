const bcrypt = require("bcrypt"); // For password hashing
const Role = require("../../models/Role"); // Assuming Role model exists
const jwt = require("jsonwebtoken");
const Admin = require("../../models/SuperAdmin/Admin"); 
const { getEmployeesByModules } = require("../../service/employeeService");

exports.createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, password, roleId, mobileNumber } =
      req.body;
    // Check if the user is an employer
    const Employee = await Admin.findOne({ email:email.toLowerCase().trim() });
    if (Employee) {
      return res
        .status(400)
        .json({ status: false, message: "Employee already exists" });
    }
    const role = await Role.findById(roleId);
    if (!role)
      return res
        .status(400)
        .json({ status: false, message: "Invalid role ID" });
    
    if (role.adminId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ status: false, message: "Access Denied to use this Role!" });
    }

    const newEmployee = new Admin({
      employerId: req.user._id,
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      password,
      roleId,
      mobileNumber,
      scope: req.user.scope,
      HotelId: req.user.scope === "Hotel" ? req.user.HotelId : undefined,
    });

    await newEmployee.save();

    return res.status(201).json({
      status: true,
      message: "Employee created successfully",
      employee: newEmployee.toObject({ virtuals: true }),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const scope = req.user.scope
    let employees
    if (scope === 'Platform') {
      employees = await Admin.find({
        scope: "Platform",
        _id: { $ne: "680c82324fcb85de5fc86bf5" },
      })
        .populate("roleId")
        .select("-password")
        .sort({ createdAt: -1 });
    } else if (scope === 'Hotel') {
      employees = await Admin.find({
        HotelId: req.user.HotelId,
        roleId: { $ne: "6825d3b66e1d426f24cda386" },
      })
        .populate("roleId")
        .select("-password")
        .sort({ createdAt: -1 });
    }
    return res.status(200).json({ status: true, employees });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  const { id } = req.params; // Get employee ID from route parameter

  try {
    const employee = await Admin.findById(id).populate("roleId");

    if (!employee) {
      return res.status(404).json({ status: false, message: 'Employee not found' });
    }
    // if (employee.employerId._id.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({status:false, message:'Access Denied to view this Employee!'})
    // }
    return res.status(200).json({
      status: true,
      message: 'Employee fetched successfully',
      employee,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error fetching employee', error: error.message });
  }
};
// Update employee details
exports.updateEmployee = async (req, res) => {
  const { id } = req.params; // Get employee ID from route parameter
  const { firstName, lastName, email, mobileNumber, status, roleId } = req.body;
  
  try {
    const admin = req.user
    const adminScope = req.user.scope
    // Check if employee exists
    let employee = await Admin.findById(id);

    if (!employee) {
      return res.status(404).json({ status: false, message: 'Employee not found' });
    }

    if (employee.scope !== adminScope) {
      return res.status(404).json({ status: false, message: 'Employee out of Scope' });
    } else if(adminScope==='Hotel'){
      if (employee.HotelId.toString() !== admin.HotelId.toString()) {
        return res.status(404).json({ status: false, message: 'Employee out of Scope of Hotel' });
      }
    }

    // Update employee details
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.mobileNumber = mobileNumber || employee.mobileNumber;
    employee.status = status || employee.status;
     if (admin.roleId._id.toString() === "6825d3b66e1d426f24cda386") {
       employee.email = email.toLowerCase() || employee.email.toLowerCase();
       employee.roleId = roleId || employee.roleId;
     }
    // Save the updated employee
    await employee.save();

    return res.status(200).json({
      status: true,
      message: 'Employee updated successfully',
      employee,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error updating employee', error: error.message });
  }
};
// Delete employee by ID
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params; // Get employee ID from route parameter

  try {
    // Find the employee by ID and remove
    const employee = await Admin.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ status: false, message: 'Employee not found' });
    }

    return res.status(200).json({
      status: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error deleting employee', error: error.message });
  }
};

exports.getEmployeesByModule = async (req, res) => {
  try {
    let { moduleName } = req.query;
    if (!moduleName) {
      return res.status(400).json({ status: false, message: "Module name is required" });
    }
    if (moduleName === "chat-management") {
      moduleName = "chat"; 
    }
    const employees = await getEmployeesByModules(moduleName, req.user.HotelId)
    return res.status(200).json({ status: true, employees });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
