import { createError } from '../utils/error.js';

export function roleGuard(...allowedRoles) {
  return (req, _res, next) => {
    // authMiddleware **must** have run before this
    if (!req.user?.role) return next(createError(401, 'Unauthenticated'));

    const authorised = allowedRoles.includes(req.user.role);
    if (!authorised)
      return next(createError(403, 'Forbidden: insufficient permissions'));

    next();
  };
}
