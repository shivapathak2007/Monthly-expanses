import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt with 12 salt rounds
 * @param {string} password - Plaintext password
 * @returns {Promise<string>} Hashed password string
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verify a plaintext password against a bcrypt hash
 * @param {string} password - Plaintext password
 * @param {string} hash - Stored hash
 * @returns {Promise<boolean>} True if valid match
 */
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
