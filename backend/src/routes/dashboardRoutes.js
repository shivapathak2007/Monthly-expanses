import { Router } from 'express';
import DashboardController from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All dashboard routes require authentication
router.use(protect);

router.get('/', DashboardController.getDashboard);
router.get('/analytics', DashboardController.getAnalytics);
router.get('/recommendations', DashboardController.getRecommendations);
router.get('/suggestions', DashboardController.getRecommendations);

export default router;
