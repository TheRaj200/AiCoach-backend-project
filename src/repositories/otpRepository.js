import { Otp } from '../models/Otp.js';
import { isDbConnected } from '../config/db.js';

const memoryOtps = new Map();

export const otpRepository = {
  async saveOtp({ email, otp, name, password }) {
    const cleanEmail = email.toLowerCase().trim();
    if (isDbConnected()) {
      try {
        await Otp.deleteMany({ email: cleanEmail });
        const newOtp = new Otp({ email: cleanEmail, otp, name, password });
        return await newOtp.save();
      } catch (err) {
        console.warn('⚠️ [OtpRepo] Mongo saveOtp failed, using memory:', err.message);
      }
    }

    memoryOtps.set(cleanEmail, {
      email: cleanEmail,
      otp,
      name,
      password,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    return true;
  },

  async verifyOtp(email, otp) {
    const cleanEmail = email.toLowerCase().trim();
    if (isDbConnected()) {
      try {
        const record = await Otp.findOne({ email: cleanEmail, otp: otp.trim() });
        return record;
      } catch (err) {
        console.warn('⚠️ [OtpRepo] Mongo verifyOtp failed, using memory:', err.message);
      }
    }

    const memRecord = memoryOtps.get(cleanEmail);
    if (!memRecord) return null;
    if (memRecord.expiresAt < Date.now()) {
      memoryOtps.delete(cleanEmail);
      return null;
    }
    if (memRecord.otp === otp.trim()) {
      return memRecord;
    }
    return null;
  },

  async deleteOtp(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isDbConnected()) {
      try {
        await Otp.deleteMany({ email: cleanEmail });
      } catch (err) { }
    }
    memoryOtps.delete(cleanEmail);
  },
};
