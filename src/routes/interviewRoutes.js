import { Router } from 'express';
import { interviewController } from '../controllers/interviewController.js';

const router = Router();

// Routes strictly delegate to Controller
router.post('/start', interviewController.start);
router.post('/submit-answer', interviewController.submitAnswer);
router.post('/submit-probe', interviewController.submitProbe);
router.post('/finish', interviewController.finish);
router.get('/history/list', interviewController.getHistory);
router.get('/:sessionId', interviewController.getSession);

export default router;
