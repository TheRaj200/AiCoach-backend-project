import { InterviewSession } from '../models/InterviewSession.js';
import { isDbConnected } from '../config/db.js';

// Resilient in-memory storage fallback
const memorySessions = new Map();

export const interviewRepository = {
  async createSession(sessionData) {
    if (isDbConnected()) {
      try {
        const session = new InterviewSession(sessionData);
        const saved = await session.save();
        memorySessions.set(sessionData.sessionId, saved.toObject ? saved.toObject() : saved);
        return saved;
      } catch (err) {
        console.warn('⚠️ [Repository] Mongo write failed, saving to memory fallback:', err.message);
      }
    }

    const session = {
      ...sessionData,
      _id: sessionData.sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memorySessions.set(sessionData.sessionId, session);
    return session;
  },

  async findBySessionId(sessionId) {
    if (isDbConnected()) {
      try {
        const doc = await InterviewSession.findOne({ sessionId });
        if (doc) return doc;
      } catch (err) {
        console.warn('⚠️ [Repository] Mongo find failed, checking memory fallback:', err.message);
      }
    }
    return memorySessions.get(sessionId) || null;
  },

  async updateSession(sessionId, updateData) {
    if (isDbConnected()) {
      try {
        const updated = await InterviewSession.findOneAndUpdate(
          { sessionId },
          { $set: updateData, updatedAt: new Date() },
          { returnDocument: 'after' }
        );
        if (updated) {
          memorySessions.set(sessionId, updated.toObject ? updated.toObject() : updated);
          return updated;
        }
      } catch (err) {
        console.warn('⚠️ [Repository] Mongo update failed, updating memory fallback:', err.message);
      }
    }

    const existing = memorySessions.get(sessionId) || {};
    const merged = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    memorySessions.set(sessionId, merged);
    return merged;
  },

  async findRecent(limit = 10, userId = null) {
    if (isDbConnected()) {
      try {
        const query = { status: 'completed' };
        if (userId && userId !== 'guest') {
          query.userId = userId;
        } else if (userId === 'guest') {
          return []; // Guests do not have saved global history
        }

        const docs = await InterviewSession.find(query)
          .sort({ updatedAt: -1 })
          .limit(limit)
          .lean();
        if (docs) return docs;
      } catch (err) {
        console.warn('⚠️ [Repository] Mongo findRecent failed, falling back to memory:', err.message);
      }
    }

    return Array.from(memorySessions.values())
      .filter((s) => {
        if (s.status !== 'completed') return false;
        if (userId && userId !== 'guest') return s.userId === userId;
        if (userId === 'guest') return false;
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  },
};

