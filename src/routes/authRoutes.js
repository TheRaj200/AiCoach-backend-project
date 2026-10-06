import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

// Auth Endpoints strictly delegate to Controller
router.post('/register-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);

export default router;
