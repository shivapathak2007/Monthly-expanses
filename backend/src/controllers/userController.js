import UserModel from '../models/userModel.js';
import { verifyPassword, hashPassword } from '../utils/passwordUtils.js';

export class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Profile retrieved',
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updated = await UserModel.update(userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          error: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          error: 'New password must be at least 6 characters long'
        });
      }

      const user = await UserModel.findByIdWithPassword(userId);
      const isMatch = await verifyPassword(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect current password',
          error: 'Current password does not match'
        });
      }

      const newHash = await hashPassword(newPassword);
      await UserModel.updatePassword(userId, newHash);

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;
      await UserModel.deleteAccount(userId);

      // Invalidate cookies if any
      res.clearCookie('spendwise_token');
      res.clearCookie('kharcha_token');

      return res.status(200).json({
        success: true,
        message: 'Your Kharcha account and all associated financial data have been permanently deleted.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
