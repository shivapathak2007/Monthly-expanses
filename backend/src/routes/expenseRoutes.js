import { Router } from 'express';
import ExpenseController from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateExpense } from '../middleware/validationMiddleware.js';

const router = Router();

// All expense routes require authentication
router.use(protect);

router.post('/', validateExpense, ExpenseController.createExpense);
router.post('/bulk-delete', ExpenseController.bulkDeleteExpenses);
router.get('/', ExpenseController.getExpenses);
router.get('/:id', ExpenseController.getExpenseById);
router.put('/:id', ExpenseController.updateExpense);
router.delete('/:id', ExpenseController.deleteExpense);

export default router;
