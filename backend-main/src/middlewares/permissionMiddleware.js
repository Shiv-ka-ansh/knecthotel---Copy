// src/middleware/permissionsMiddleware.js

module.exports = (requiredModule, requiredPermission) => {
  return (req, res, next) => {
    try {
      // If the user is a Super Admin, grant access
      if (req.user.isSuperAdmin) {
        return next(); // Super Admin bypasses permission checks
      }

      // Check if the user has the correct permission for the module
      const permission = req.user.roleId.permissions.find(
        (p) => p.module === requiredModule,
      );

      if (!permission) {
        return res
          .status(403)
          .json({ message: 'Permission denied: Module not found' });
      }

      // Check if the user has the required permission in the module
      if (
        !permission.access.includes(requiredPermission) &&
        !permission.access.includes('all')
      ) {
        return res.status(403).json({
          message: `Permission denied: You don't have ${requiredPermission} access`,
        });
      }

      // If user has permission, proceed to next middleware/route
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error', error });
    }
  };
};
