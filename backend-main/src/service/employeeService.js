const Role = require("../models/Role");
const Admin = require("../models/SuperAdmin/Admin");
const ApiError = require("../utils/ApiError");

exports.getEmployeesByModules = async (moduleName, HotelId) => {
  if (!moduleName) {
    throw new ApiError(400, "moduleName is required!");
  }

  // Find roles that include the module in their permissions
  const rolesWithModule = await Role.find({
    "permissions.module": moduleName,
  }).select("_id");

  const roleIds = rolesWithModule.map((role) => role._id);

  // Find employees with those roles and populate their role details
  const employees = await Admin.find({
    roleId: { $in: roleIds },
    HotelId,
  })
    .populate("roleId", "name") // Only populate the role name
    .select("-password")
        .sort({ createdAt: -1 });
    
  return employees
};