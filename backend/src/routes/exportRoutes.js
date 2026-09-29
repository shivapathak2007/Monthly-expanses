import { Router } from 'express';
import ExportController from '../controllers/exportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All export endpoints require authentication
router.use(protect);

router.get('/preview', ExportController.getPreview);
router.get('/download', ExportController.downloadExcel);
router.post('/download', ExportController.downloadExcel);
router.get('/history', ExportController.getHistory);

export default router;
