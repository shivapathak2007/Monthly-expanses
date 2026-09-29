import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generate a signed JWT for a user
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} Signed JWT
 */
export const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

/**
 * Verify a JWT
 * @param {string} token - Signed JWT
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
