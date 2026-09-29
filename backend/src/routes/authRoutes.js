import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = Router();

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', authLimiter, validateRegister, AuthController.register);
router.post('/login', authLimiter, validateLogin, AuthController.login);
router.post('/logout', protect, AuthController.logout);
router.get('/me', protect, AuthController.getMe);

export default router;
