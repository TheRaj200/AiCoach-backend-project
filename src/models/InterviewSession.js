import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  questionId: { type: Number, required: true },
  questionText: { type: String, required: true },
  category: { type: String, default: 'Technical' }, // 'Theory' | 'Coding' | 'System Design' | 'Scenario'
  difficulty: { type: String, default: 'Medium' },
  userAnswer: { type: String, default: '' },
  answerType: { type: String, enum: ['text', 'voice'], default: 'text' },
  timeSpentSeconds: { type: Number, default: 0 },
  followUpProbe: { type: String, default: '' },
  probeAnswer: { type: String, default: '' },
  feedback: {
    accuracyScore: { type: Number, min: 0, max: 10, default: null },
    clarityScore: { type: Number, min: 0, max: 10, default: null },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    idealAnswer: { type: String, default: '' },
  },
  answeredAt: { type: Date },
});

const FinalReportSchema = new mongoose.Schema({
  overallScore: { type: Number, min: 0, max: 100 },
  grade: { type: String }, // e.g., 'Ready to Hire (L4+)', 'Solid Competence', 'Needs More Prep'
  technicalScore: { type: Number, min: 0, max: 100 },
  communicationScore: { type: Number, min: 0, max: 100 },
  summary: { type: String },
  topStrengths: [{ type: String }],
  criticalGaps: [{ type: String }],
  suggestedTopics: [{ type: String }],
});

const InterviewSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: 'guest' },
    role: { type: String, required: true },
    seniority: { type: String, enum: ['Junior', 'Mid-Level', 'Senior'], default: 'Junior' },
    techStack: [{ type: String }],
    resumeText: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    totalQuestions: { type: Number, default: 5 },
    currentQuestionIndex: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    questions: [QuestionSchema],
    finalReport: { type: FinalReportSchema, default: null },
  },
  {
    timestamps: true,
  }
);

export const InterviewSession = mongoose.model('InterviewSession', InterviewSessionSchema);
