import { Router } from 'express';
import IncomeController from '../controllers/incomeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateIncome } from '../middleware/validationMiddleware.js';

const router = Router();

// All income routes require authentication
router.use(protect);

router.post('/', validateIncome, IncomeController.createIncome);
router.get('/', IncomeController.getIncome);
router.get('/:id', IncomeController.getIncomeById);
router.put('/:id', IncomeController.updateIncome);
router.delete('/:id', IncomeController.deleteIncome);

export default router;
