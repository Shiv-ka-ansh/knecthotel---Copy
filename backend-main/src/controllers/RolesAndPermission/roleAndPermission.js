const Role = require('../../models/Role');
const { modules } = require('../../config/modules');

exports.createRole = async (req, res) => {
  const { name, permissions } = req.body;
  try {
    // Validate modules and permissions
    for (const permission of permissions) {
      // Check if the module exists
      const module = modules.find((m) => m.name === permission.module);
      if (!module) {
        return res.status(400).json({ status: false, message: `Invalid module: ${permission.module}` });
      }

      // Check if the permissions are valid for the module
      const invalidPermissions = permission.access.filter(
        (perm) => !module.permissions.includes(perm)
      );
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          status: false,
          message: `Invalid permissions for ${permission.module}: ${invalidPermissions.join(', ')}`,
        });
      }
    }

    const role = new Role({
      name,
      permissions,
      scope: req.user.scope,
      adminId: req.user._id,
      HotelId: req.user.scope === "Hotel" ? req.user.HotelId : undefined,
    });

    await role.save();

    return res.status(201).json({
      status: true,
      message: 'Role created successfully',
      role,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error creating role', error: error.message });
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  const { roleId } = req.params;
  const { name, permissions } = req.body;

  try {
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ status: false, message: 'Role not found' });
    }
    if (role.adminId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          message:
            "Invalid Permission! You can only edit roles that you have created.",
        });
    }

    role.name = name || role.name;
    role.permissions = permissions || role.permissions;

    await role.save();
    return res.status(200).json({
      status: true,
      message: 'Role updated successfully',
      role,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error updating role', error: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  const { roleId } = req.params;

  try {
    const role = await Role.findByIdAndDelete(roleId);
    if (!role) {
      return res.status(404).json({ status: false, message: 'Role not found' });
    }
    if (role.name == 'Super Admin' || role.name == 'admin') {
      return res.status(403).json({ message: "This role id cannot be deleted!" });

    }
    if (role.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Invalid Permission!" });
    }

    return res.status(200).json({
      status: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Error deleting role', error: error.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const scope = req.user.scope;
    let roles;
    if (scope === "Platform") {
      roles = await Role.find({
        scope: "Platform",
        _id: { $nin: ["68369b5176485c797476c995", "6825d3b66e1d426f24cda386"] },
      }).sort({
        createdAt: -1,  
      }).lean();
    } else if (scope === "Hotel") {
      roles = await Role.find({
        HotelId: req.user.HotelId,
        _id: { $ne: "6825d3b66e1d426f24cda386" },
      }).sort({
        createdAt: -1,
      }).lean();
    }
    return res.status(200).json({
      status: true,
      roles: roles,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({ status: false, message: 'Error fetching roles', error: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  const { roleId } = req.params;

  try {
    const role = await Role.findById(roleId); // Find the role by ID
    if (!role) {
      return res.status(404).json({ status: false, message: 'Role not found' });
    }

    return res.status(200).json({
      status: true,
      role: role,
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return res.status(500).json({ status: false, message: 'Error fetching role', error: error.message });
  }
};
