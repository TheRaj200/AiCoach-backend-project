import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';
import { otpRepository } from '../repositories/otpRepository.js';
import { sendOtpEmail } from '../config/mail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'preppilot_ai_super_secret_jwt_key_2026';

export const authService = {
  /**
   * Step 1: Send registration OTP
   */
  async sendRegistrationOtp({ name, email, password }) {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please log in instead.');
    }

    // Hash password before saving to temp OTP record
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to OTP repo
    await otpRepository.saveOtp({
      email: cleanEmail,
      otp,
      name: name.trim(),
      password: hashedPassword,
    });

    // Send Email (and log to console for dev)
    await sendOtpEmail(cleanEmail, otp, name);

    return {
      message: `Verification code sent to ${cleanEmail}. Check your inbox (or server logs).`,
      email: cleanEmail,
    };
  },

  /**
   * Step 2: Verify OTP and finalize registration
   */
  async verifyOtpAndRegister({ email, otp }) {
    if (!email || !otp) {
      throw new Error('Email and OTP code are required');
    }

    const cleanEmail = email.toLowerCase().trim();
    const validOtpRecord = await otpRepository.verifyOtp(cleanEmail, otp);

    if (!validOtpRecord) {
      throw new Error('Invalid or expired verification code. Please check or request a new one.');
    }

    // Create user in DB
    const newUser = await userRepository.createUser({
      name: validOtpRecord.name,
      email: cleanEmail,
      password: validOtpRecord.password,
      isVerified: true,
    });

    // Delete used OTP
    await otpRepository.deleteOtp(cleanEmail);

    // Sign JWT
    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
      },
      token,
    };
  },

  /**
   * Direct Login with Email and Password
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(cleanEmail);

    if (!user) {
      throw new Error('No account found with this email. Please register first.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Incorrect password. Please try again.');
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      token,
    };
  },

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  },
};
