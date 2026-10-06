import { authService } from '../services/authService.js';

export const authController = {
  /**
   * POST /api/auth/register-otp
   */
  async requestOtp(req, res) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.sendRegistrationOtp({ name, email, password });
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ [AuthController] Error requesting OTP:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * POST /api/auth/verify-otp
   */
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOtpAndRegister({ email, otp });
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ [AuthController] Error verifying OTP:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ [AuthController] Error logging in:', error.message);
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  },
};
