import jwt from 'jsonwebtoken';
import { createError } from './error.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

export function signToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export async function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw createError(401, 'Invalid or expired token');
  }
}
