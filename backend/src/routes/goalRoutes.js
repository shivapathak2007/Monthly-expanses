import { Router } from 'express';
import GoalController from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateGoal } from '../middleware/validationMiddleware.js';

const router = Router();

// All goals routes require authentication
router.use(protect);

router.post('/', validateGoal, GoalController.createGoal);
router.get('/', GoalController.getGoals);
router.put('/:id', GoalController.updateGoal);
router.delete('/:id', GoalController.deleteGoal);

export default router;
