const express = require("express");
const router = express.Router();
const employeeController = require("../../controllers/Employee/employeeController");
const { isSuperAdmin } = require("../../middlewares/IsSuperAdminMiddleware");
const isAdmin = require("../../middlewares/IsAdminMiddleware");
const { validateToken } = require("../../middlewares/authMiddleware");
const permissionMiddleware = require('../../middlewares/permissionMiddleware');

// Routes for CRUD operations
router.post("/", validateToken, permissionMiddleware('admin-management', 'write'), employeeController.createEmployee)

// Get all employees

router.get( "/",validateToken, permissionMiddleware("admin-management", "read"), employeeController.getAllEmployees);
router.get(
  "/by-module",
  validateToken,
  employeeController.getEmployeesByModule
);

// Get employee by ID
router.get("/:id", validateToken, permissionMiddleware("admin-management", "read"), employeeController.getEmployeeById); 

// Update employee
router.put("/:id", validateToken, permissionMiddleware("admin-management", "write"), employeeController.updateEmployee); 

// Delete employee
router.delete("/:id", validateToken, permissionMiddleware("admin-management", "write"), employeeController.deleteEmployee); 

module.exports = router;
