import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000), index: { expires: '10m' } },
  },
  {
    timestamps: true,
  }
);

export const Otp = mongoose.model('Otp', OtpSchema);
