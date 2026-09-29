import { Router } from 'express';
import UserController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateProfile } from '../middleware/validationMiddleware.js';

const router = Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', UserController.getProfile);
router.put('/profile', validateProfile, UserController.updateProfile);
router.put('/change-password', UserController.changePassword);
router.delete('/account', UserController.deleteAccount);
router.delete('/', UserController.deleteAccount);

export default router;
