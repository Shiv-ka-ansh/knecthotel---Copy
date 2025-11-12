const express = require('express');
const router = express.Router();

const { createRole, updateRole, deleteRole ,getRoleById,getAllRoles,} = require('../../controllers/RolesAndPermission/roleAndPermission')
const isAdmin = require('../../middlewares/IsAdminMiddleware');  
const permissionMiddleware = require('../../middlewares/permissionMiddleware');
const { validateToken } = require('../../middlewares/authMiddleware');

router.post(
  "/create-role",
  validateToken,
  permissionMiddleware("roles-and-permissions", "write"),
  createRole
); 
router.put(
  "/update-role/:roleId",
  validateToken,
  permissionMiddleware("roles-and-permissions", "write"),
  updateRole
);        
router.delete(
  "/delete-role/:roleId",
  validateToken,
  permissionMiddleware("roles-and-permissions", "write"),
  deleteRole
); 
router.get(
  "/get-role/:roleId",
  validateToken,
  permissionMiddleware("roles-and-permissions", "read"),
  getRoleById
);
router.get(
  "/get-all-roles",
  validateToken,
  permissionMiddleware("roles-and-permissions", "read"),
  getAllRoles
);

module.exports = router;