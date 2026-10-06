import { User } from '../models/User.js';
import { isDbConnected } from '../config/db.js';

const memoryUsers = new Map();

export const userRepository = {
  async findByEmail(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (isDbConnected()) {
      try {
        return await User.findOne({ email: cleanEmail });
      } catch (err) {
        console.warn('⚠️ [UserRepo] Mongo findByEmail failed, using memory:', err.message);
      }
    }
    return Array.from(memoryUsers.values()).find((u) => u.email === cleanEmail) || null;
  },

  async findById(id) {
    if (isDbConnected()) {
      try {
        return await User.findById(id).select('-password');
      } catch (err) {
        console.warn('⚠️ [UserRepo] Mongo findById failed, using memory:', err.message);
      }
    }
    const u = memoryUsers.get(id);
    if (!u) return null;
    const { password, ...safeUser } = u;
    return safeUser;
  },

  async createUser(userData) {
    const cleanEmail = (userData.email || '').toLowerCase().trim();
    if (isDbConnected()) {
      try {
        const user = new User({ ...userData, email: cleanEmail });
        const saved = await user.save();
        const obj = saved.toObject ? saved.toObject() : saved;
        memoryUsers.set(obj._id.toString(), obj);
        return obj;
      } catch (err) {
        console.warn('⚠️ [UserRepo] Mongo createUser failed, using memory fallback:', err.message);
      }
    }

    const id = `mem_usr_${Date.now()}`;
    const user = {
      _id: id,
      ...userData,
      email: cleanEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryUsers.set(id, user);
    return user;
  },
};
