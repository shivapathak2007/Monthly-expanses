import { Router } from 'express';
import BudgetController from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBudget } from '../middleware/validationMiddleware.js';

const router = Router();

// All budget routes require authentication
router.use(protect);

router.post('/', validateBudget, BudgetController.createBudget);
router.get('/', BudgetController.getBudgets);
router.put('/:id', BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

export default router;
