// src/middlewares/validateRequest.js
import { z } from 'zod';
import { createError } from '../utils/error.js';

/**
 * Pass Zod schemas for body / query / params.
 * Example:
 *   router.post('/guests',
 *     validateRequest({ body: guestCreateSchema }),
 *     controller.createGuest)
 */
export function validateRequest({ body, query, params } = {}) {
  // Allow undefined to skip certain parts
  return (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      return next();
    } catch (err) {
      // ZodError → 422 Unprocessable Entity
      return next(createError(422, 'Validation failed', err.errors));
    }
  };
}
