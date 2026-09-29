import UserModel from '../models/userModel.js';
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';
import { generateToken } from '../utils/generateToken.js';
import { env } from '../config/env.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, age, monthly_income, currency } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists',
          error: 'Email already registered'
        });
      }

      // Hash password using bcrypt (12 rounds)
      const password_hash = await hashPassword(password);

      // Create new user record
      const newUser = await UserModel.create({
        name,
        email,
        password_hash,
        age,
        monthly_income: monthly_income || 0,
        currency: currency || 'INR'
      });

      // Generate JWT
      const token = generateToken(newUser.id, newUser.email);

      // Attach HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Safe user object (NEVER expose password_hash)
      const safeUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        monthly_income: newUser.monthly_income,
        currency: newUser.currency,
        profile_picture: newUser.profile_picture,
        created_at: newUser.created_at
      };

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user: safeUser,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user with password hash
      const user = await UserModel.findByIdWithPassword((await UserModel.findByEmail(email))?.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'Authentication failed'
        });
      }

      // Verify password with bcrypt
      const isMatch = await verifyPassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'Authentication failed'
        });
      }

      // Generate JWT
      const token = generateToken(user.id, user.email);

      // Attach HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Safe user data (NEVER return password_hash)
      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        monthly_income: user.monthly_income,
        currency: user.currency,
        profile_picture: user.profile_picture,
        created_at: user.created_at
      };

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user: safeUser,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  static async getMe(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Current user retrieved',
      data: {
        user: req.user
      }
    });
  }
}

export default AuthController;
