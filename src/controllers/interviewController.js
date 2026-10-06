import { interviewService } from '../services/interviewService.js';

export const interviewController = {
  /**
   * POST /api/interview/start
   */
  async start(req, res) {
    try {
      const { role, seniority, techStack, totalQuestions, userId } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          error: 'Role is required (e.g., Frontend Developer, Backend Engineer)',
        });
      }

      const session = await interviewService.startInterview({
        role,
        seniority,
        techStack,
        totalQuestions,
        userId,
      });

      return res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error('❌ [Controller] Error starting interview:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to initialize interview session',
      });
    }
  },

  /**
   * POST /api/interview/submit-answer
   */
  async submitAnswer(req, res) {
    try {
      const { sessionId, questionIndex, userAnswer, answerType, timeSpentSeconds } = req.body;

      if (!sessionId || questionIndex === undefined || userAnswer === undefined) {
        return res.status(400).json({
          success: false,
          error: 'sessionId, questionIndex, and userAnswer are required fields',
        });
      }

      const result = await interviewService.submitAnswerAndEvaluate({
        sessionId,
        questionIndex: Number(questionIndex),
        userAnswer,
        answerType,
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ [Controller] Error evaluating answer:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to evaluate answer',
      });
    }
  },

  /**
   * POST /api/interview/finish
   */
  async finish(req, res) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId is required to finalize interview',
        });
      }

      const completedSession = await interviewService.finalizeInterview({ sessionId });

      return res.status(200).json({
        success: true,
        data: completedSession,
      });
    } catch (error) {
      console.error('❌ [Controller] Error finalizing interview:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to finalize interview report',
      });
    }
  },

  /**
   * GET /api/interview/:sessionId
   */
  async getSession(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId is required',
        });
      }

      const session = await interviewService.getSessionById(sessionId);

      return res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error('❌ [Controller] Error fetching session:', error);
      return res.status(404).json({
        success: false,
        error: error.message || 'Session not found',
      });
    }
  },

  /**
   * GET /api/interview/history/list
   */
  async getHistory(req, res) {
    try {
      const limit = req.query.limit || 10;
      const userId = req.query.userId || null;
      const history = await interviewService.getRecentHistory(limit, userId);

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('❌ [Controller] Error fetching history:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch interview history',
      });
    }
  },
};
