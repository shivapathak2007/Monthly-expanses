import { verifyToken } from '../utils/generateToken.js';
import UserModel from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token = null;

  // Check Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to continue.',
      error: 'No authorization token provided'
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
        error: 'User not found'
      });
    }

    // Attach user to request object (without sensitive data)
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      monthly_income: user.monthly_income,
      currency: user.currency,
      profile_picture: user.profile_picture,
      created_at: user.created_at
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.',
      error: err.message
    });
  }
};
