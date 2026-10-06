import { v4 as uuidv4 } from 'uuid';
import { interviewRepository } from '../repositories/interviewRepository.js';
import { generateAIJSON, getGeminiClient } from '../config/gemini.js';

// Comprehensive Role & Tech-Specific Fallback Question Bank
const QUESTION_BANK = {
  'Frontend Developer': [
    {
      questionText: 'Can you explain the React Fiber reconciliation architecture and how it differs from the older stack reconciler during heavy UI rendering updates?',
      category: 'React Internals',
      difficulty: 'Hard',
    },
    {
      questionText: 'What happens in the browser Critical Rendering Path from receiving HTML bytes to painting pixels on screen? How do you optimize Largest Contentful Paint (LCP)?',
      category: 'Web Performance',
      difficulty: 'Medium',
    },
    {
      questionText: 'How do TypeScript Generics and Conditional Types work? Can you give a real-world example of creating a type-safe API client wrapper?',
      category: 'TypeScript',
      difficulty: 'Medium',
    },
    {
      questionText: 'Compare Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Incremental Static Regeneration (ISR). When would you choose each architecture?',
      category: 'Architecture & Next.js',
      difficulty: 'Medium',
    },
    {
      questionText: 'How would you diagnose and fix memory leaks caused by uncleared event listeners, detached DOM nodes, or uncancelled promises in a Single Page App?',
      category: 'Debugging & Memory',
      difficulty: 'Hard',
    },
    {
      questionText: 'Explain the CSS Box Model, stacking contexts (z-index), and how GPU-accelerated CSS properties (like transform and opacity) prevent layout reflows.',
      category: 'CSS & Rendering',
      difficulty: 'Easy',
    },
  ],
  'Backend Developer': [
    {
      questionText: 'How does Node.js handle CPU-intensive tasks without blocking the Event Loop? When would you use Worker Threads versus Child Processes versus Cluster module?',
      category: 'Node.js & Concurrency',
      difficulty: 'Hard',
    },
    {
      questionText: 'How would you design a distributed rate limiter that works across multiple backend instances using Redis and the Sliding Window Log or Token Bucket algorithm?',
      category: 'Distributed Systems',
      difficulty: 'Hard',
    },
    {
      questionText: 'Explain database indexing under the hood (B-Tree vs Hash index). How do compound indexes work, and why does column order matter in an index?',
      category: 'Databases & Query Optimization',
      difficulty: 'Medium',
    },
    {
      questionText: 'How do you handle database transaction isolation levels and prevent race conditions (e.g. double booking or concurrent balance deductions)?',
      category: 'Concurrency & ACID',
      difficulty: 'Hard',
    },
    {
      questionText: 'Compare REST, GraphQL, and gRPC. In what high-throughput production scenarios would you choose gRPC over REST/JSON?',
      category: 'API Architecture',
      difficulty: 'Medium',
    },
    {
      questionText: 'How do you structure resilient microservices communication? Explain Circuit Breaker patterns and Dead Letter Queues (DLQs) in message brokers like RabbitMQ/Kafka.',
      category: 'Microservices & Resilience',
      difficulty: 'Hard',
    },
  ],
  'Full-Stack Developer': [
    {
      questionText: 'Can you explain the Event Loop in JavaScript and how asynchronous operations like microtasks (Promises) and macrotasks (setTimeout, I/O) are processed?',
      category: 'Core JavaScript',
      difficulty: 'Medium',
    },
    {
      questionText: 'How do you handle authentication and session management securely in a fullstack SPA? Compare HttpOnly SameSite cookies vs JWT stored in localStorage.',
      category: 'Web Security',
      difficulty: 'Hard',
    },
    {
      questionText: 'What are the main performance bottlenecks in React applications, and how do tools like React.memo, useMemo, and useCallback mitigate them?',
      category: 'React & Performance',
      difficulty: 'Medium',
    },
    {
      questionText: 'How do you implement optimistic UI updates on the frontend while ensuring complete data consistency and error rollbacks if the backend mutation fails?',
      category: 'Fullstack Architecture',
      difficulty: 'Medium',
    },
    {
      questionText: 'Explain the difference between SQL and NoSQL database schema design. When would you embed documents vs reference them in MongoDB?',
      category: 'Database Design',
      difficulty: 'Medium',
    },
    {
      questionText: 'How would you secure a fullstack application against common OWASP Top 10 threats such as SQL/NoSQL Injection, XSS, and CSRF attacks?',
      category: 'Application Security',
      difficulty: 'Hard',
    },
  ],
  'AI / ML Engineer': [
    {
      questionText: 'Explain the architecture of Retrieval-Augmented Generation (RAG). How do vector embeddings, chunking strategies, and cosine similarity retrieval interact in production?',
      category: 'RAG & Vector Search',
      difficulty: 'Hard',
    },
    {
      questionText: 'What is the difference between LoRA fine-tuning and full parameter fine-tuning of Large Language Models? How does LoRA reduce compute & memory requirements?',
      category: 'LLM Fine-tuning',
      difficulty: 'Hard',
    },
    {
      questionText: 'How do you mitigate LLM hallucination and enforce structured JSON output in production agentic workflows?',
      category: 'AI Agents & Reliability',
      difficulty: 'Medium',
    },
    {
      questionText: 'How do you optimize LLM inference latency and throughput? Explain KV Caching, Quantization (4-bit/8-bit), and Batching.',
      category: 'Model Inference & Scaling',
      difficulty: 'Hard',
    },
    {
      questionText: 'How would you build an asynchronous streaming API in Python (FastAPI) to deliver real-time token streams from an AI model to a client application?',
      category: 'AI Engineering & APIs',
      difficulty: 'Medium',
    },
  ],
  'DevOps Engineer': [
    {
      questionText: 'How do you optimize Docker image build size and security using multi-stage builds, non-root users, and minimal base images (like Alpine or Distroless)?',
      category: 'Docker & Containers',
      difficulty: 'Medium',
    },
    {
      questionText: 'Explain the Kubernetes Pod lifecycle. What is the difference between Liveness, Readiness, and Startup probes, and what happens when they fail?',
      category: 'Kubernetes',
      difficulty: 'Hard',
    },
    {
      questionText: 'How would you design a zero-downtime deployment strategy (e.g. Blue-Green vs Canary) in a Kubernetes or cloud environment with automatic health rollback?',
      category: 'CI/CD & Deployments',
      difficulty: 'Hard',
    },
    {
      questionText: 'How do you implement Infrastructure as Code (IaC) with Terraform while safely handling state locking, secrets management, and drift detection?',
      category: 'Infrastructure as Code',
      difficulty: 'Medium',
    },
    {
      questionText: 'What are the core metrics in Prometheus and Grafana for monitoring service health (the 4 Golden Signals)? How do you set up actionable alerting?',
      category: 'Observability & Monitoring',
      difficulty: 'Medium',
    },
  ],
  'Mobile Developer': [
    {
      questionText: 'Explain how React Native’s New Architecture (Fabric and TurboModules) improves upon the legacy asynchronous JSON bridge.',
      category: 'React Native Architecture',
      difficulty: 'Hard',
    },
    {
      questionText: 'How do you handle offline-first mobile synchronization, conflict resolution, and local database caching (e.g., SQLite/WatermelonDB/Realm)?',
      category: 'Mobile Storage & Sync',
      difficulty: 'Hard',
    },
    {
      questionText: 'How do you profile and eliminate 60 FPS frame drops (jank) in mobile applications caused by heavy JavaScript thread computations?',
      category: 'Mobile Performance',
      difficulty: 'Medium',
    },
    {
      questionText: 'How does mobile app lifecycle management (background, foreground, suspended) affect push notifications, background location, and network tasks?',
      category: 'Mobile OS Lifecycles',
      difficulty: 'Medium',
    },
  ],
};

// Helper to get a random non-duplicate question from bank
const getRandomUniqueQuestion = (role, usedQuestions = []) => {
  const rolePool = QUESTION_BANK[role] || QUESTION_BANK['Full-Stack Developer'];
  const allPool = Object.values(QUESTION_BANK).flat();
  const usedTexts = new Set(usedQuestions.map((q) => (typeof q === 'string' ? q : q.questionText)));

  // Try unused questions from matching role pool first
  const unusedRoleQuestions = rolePool.filter((q) => !usedTexts.has(q.questionText));
  if (unusedRoleQuestions.length > 0) {
    const randomIdx = Math.floor(Math.random() * unusedRoleQuestions.length);
    return unusedRoleQuestions[randomIdx];
  }

  // Fallback to any unused questions across all pools
  const unusedAllQuestions = allPool.filter((q) => !usedTexts.has(q.questionText));
  if (unusedAllQuestions.length > 0) {
    const randomIdx = Math.floor(Math.random() * unusedAllQuestions.length);
    return unusedAllQuestions[randomIdx];
  }

  // If literally all exhausted, return a randomized pick
  return rolePool[Math.floor(Math.random() * rolePool.length)];
};

export const interviewService = {
  /**
   * Start a new interview session and generate the initial question
   */
  async startInterview({ role, seniority, techStack, totalQuestions = 5, userId = 'guest' }) {
    const sessionId = uuidv4();
    const stackStr = Array.isArray(techStack) && techStack.length > 0 ? techStack.join(', ') : 'General Fullstack';
    const targetRole = role || 'Full-Stack Developer';
    const targetSeniority = seniority || 'Junior';

    let firstQuestion = null;

    if (getGeminiClient()) {
      const prompt = `
You are an expert principal technical interviewer conducting an intense mock interview for a ${targetSeniority} ${targetRole}.
Target Tech Stack: ${stackStr}.

Task: Generate Question #1.
Requirements:
1. Must be a REAL, HIGH-IMPACT, practical technical interview question testing core principles or architecture of ${stackStr}.
2. Must match ${targetSeniority} expectations (e.g. Junior = core mechanics & syntax; Senior = scale, internals, trade-offs, debugging).
3. Do NOT ask trivial trivia; ask an applied engineering question.

Return a JSON object in this exact schema:
{
  "questionText": "Clear, precise technical interview question",
  "category": "Theory / Coding / Architecture / Scenario",
  "difficulty": "Easy / Medium / Hard"
}
`;
      try {
        firstQuestion = await generateAIJSON(prompt, 'You are an elite principal technical interviewer. Return JSON only.');
      } catch (err) {
        console.warn('⚠️ [Service] AI question generation failed, using fallback:', err.message);
      }
    }

    if (!firstQuestion || !firstQuestion.questionText) {
      firstQuestion = getRandomUniqueQuestion(targetRole, []);
    }

    const sessionData = {
      sessionId,
      userId,
      role: role || 'Full-Stack Developer',
      seniority: seniority || 'Junior',
      techStack: Array.isArray(techStack) ? techStack : ['JavaScript', 'React', 'Node.js'],
      totalQuestions: Number(totalQuestions) || 5,
      currentQuestionIndex: 0,
      status: 'in-progress',
      questions: [
        {
          questionId: 1,
          questionText: firstQuestion.questionText,
          category: firstQuestion.category || 'Technical',
          difficulty: firstQuestion.difficulty || 'Medium',
          userAnswer: '',
          answerType: 'text',
          timeSpentSeconds: 0,
          feedback: {},
        },
      ],
      finalReport: null,
    };

    const created = await interviewRepository.createSession(sessionData);
    return created;
  },

  /**
   * Submit an answer for the current question, evaluate it, and generate the next question
   */
  async submitAnswerAndEvaluate({ sessionId, questionIndex, userAnswer, answerType = 'text', timeSpentSeconds = 0 }) {
    const session = await interviewRepository.findBySessionId(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }

    if (session.status === 'completed') {
      throw new Error('Interview session is already finalized');
    }

    const questions = [...(session.questions || [])];
    const targetQ = questions[questionIndex];

    if (!targetQ) {
      throw new Error(`Question index ${questionIndex} out of range`);
    }

    // Helper function to extract meaningful keywords from text
    const extractKeywords = (text) => {
      const stopWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'or', 'by',
        'with', 'how', 'what', 'why', 'can', 'you', 'explain', 'when', 'would', 'like', 'main',
        'your', 'about', 'from', 'this', 'that', 'these', 'those', 'are', 'was', 'were', 'be',
        'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'kuch', 'bhi', 'hai', 'kya',
        'main', 'toh', 'nahi', 'karo', 'kar', 'raha', 'hun', 'tha', 'thi', 'the', 'ka', 'ki', 'ke'
      ]);
      return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w));
    };

    // Helper function to detect gibberish, off-topic, or low-effort spam answers
    const evaluateRelevanceAndEffort = (text, questionText) => {
      const clean = (text || '').trim();
      if (clean.length < 8) {
        return { isSpam: true, reason: 'Answer is too short or empty' };
      }
      
      // Repeated consecutive characters like "aaaaa", "asdfasdf", "zzzz"
      if (/(.)\1{4,}/i.test(clean)) {
        return { isSpam: true, reason: 'Repeated characters / keyboard smash detected' };
      }

      const words = clean.split(/\s+/).filter(Boolean);
      if (words.length < 4) {
        return { isSpam: true, reason: 'Answer contains too few words to be a technical explanation' };
      }

      const commonGibberish = ['asdf', 'qwerty', 'zxcv', 'random', 'idk', 'dunno', 'nothing', 'blah', 'test', 'kuch bhi', 'lorem ipsum', 'blabla', 'fake'];
      if (commonGibberish.some((g) => clean.toLowerCase().includes(g))) {
        return { isSpam: true, reason: 'Non-technical / placeholder keywords detected' };
      }

      // Check question topic overlap
      const qKeywords = extractKeywords(questionText);
      const aKeywords = extractKeywords(clean);
      const matchCount = aKeywords.filter((w) => qKeywords.some((q) => q.includes(w) || w.includes(q))).length;

      // Also check standard technical vocab
      const techLexicon = ['function', 'thread', 'callstack', 'heap', 'queue', 'async', 'sync', 'promise', 'callback', 'dom', 'component', 'state', 'props', 'render', 'memory', 'cpu', 'cache', 'database', 'query', 'index', 'table', 'key', 'token', 'request', 'response', 'api', 'server', 'client', 'http', 'cookie', 'jwt', 'security', 'latency', 'bandwidth', 'rate', 'limit', 'event', 'loop', 'macro', 'micro', 'task', 'hook', 'effect', 'memo', 'virtual', 'node', 'sql', 'nosql', 'scale', 'cluster', 'load'];
      const techMatchCount = aKeywords.filter((w) => techLexicon.includes(w)).length;

      if (matchCount === 0 && techMatchCount === 0) {
        return { isSpam: true, reason: 'No relevant technical terms or question context matched' };
      }

      return { isSpam: false, matchCount, techMatchCount, totalWords: words.length };
    };

    const relevance = evaluateRelevanceAndEffort(userAnswer, targetQ.questionText);
    const isSpam = relevance.isSpam;

    // Evaluate answer via Gemini if valid AI key available and not spam
    let feedback = null;
    if (getGeminiClient() && !isSpam) {
      const prompt = `
You are a STRICT, HONEST, and UNCOMPROMISING Principal Engineering Hiring Bar Raiser.
Candidate is interviewing for: ${session.seniority} ${session.role}
Question: "${targetQ.questionText}"
Candidate's Answer: "${userAnswer}"

Evaluation Rules:
1. Be brutally honest, rigorous, and objective. NEVER award unearned points or sugarcoat mistakes.
2. If the answer is completely off-topic, random words, joke, or superficial, award 0/10 or 1/10.
3. If the answer is partially correct but misses core mechanics, award 3-4/10.
4. If the answer is decent but lacks edge-cases or production depth, award 6-7/10.
5. Award 8-10 ONLY for outstanding, senior-level precision covering execution mechanics, trade-offs, and failure modes.
6. If no valid technical points exist, explicitly put in strengths: ["No valid technical concepts demonstrated"].

Return a JSON object in this exact format:
{
  "accuracyScore": 1, // Integer 0-10
  "clarityScore": 1, // Integer 0-10
  "strengths": ["None" or valid strong point],
  "improvements": ["Specific error / misconception 1", "Specific missing concept 2"],
  "idealAnswer": "A concise, high-impact 2-3 sentence ideal answer from a principal engineer explaining how to properly solve this."
}
`;
      try {
        feedback = await generateAIJSON(prompt, 'You are a rigorous, honest, and strict technical interview bar raiser. Return JSON only.');
      } catch (err) {
        console.warn('⚠️ [Service] AI evaluation error, using fallback:', err.message);
      }
    }

    if (isSpam) {
      feedback = {
        accuracyScore: 0,
        clarityScore: 1,
        strengths: ['No relevant technical concepts demonstrated in response'],
        improvements: [
          `Response rejected: ${relevance.reason}`,
          `Did not address the core subject matter of: "${targetQ.questionText}"`,
          'Provide a concrete technical explanation with mechanisms, syntax, or architecture.',
        ],
        idealAnswer: `For "${targetQ.questionText}", a strong candidate explains the underlying architecture, execution lifecycle, and practical engineering trade-offs.`,
      };
    } else if (!feedback || typeof feedback.accuracyScore !== 'number') {
      // Offline fallback heuristic evaluation for legitimate text
      const { matchCount = 0, techMatchCount = 0, totalWords = 0 } = relevance;
      
      if (totalWords < 12 || (matchCount + techMatchCount) < 2) {
        feedback = {
          accuracyScore: 2,
          clarityScore: 3,
          strengths: ['Attempted to touch upon relevant concepts'],
          improvements: [
            'Response is very shallow and misses key internal mechanisms',
            `Elaborate specifically on how "${targetQ.questionText.slice(0, 50)}..." behaves under the hood`,
          ],
          idealAnswer: `A comprehensive answer for "${targetQ.questionText}" covers core runtime mechanisms, typical failure modes, and performance trade-offs.`,
        };
      } else if ((matchCount + techMatchCount) >= 4 && totalWords >= 25) {
        feedback = {
          accuracyScore: 8,
          clarityScore: 8,
          strengths: ['Mentioned key domain terminology and accurate flow'],
          improvements: [
            'Include specific production edge-cases and error boundary handling',
            'Discuss memory/CPU profiling implications in high-load scenarios',
          ],
          idealAnswer: `For "${targetQ.questionText}", a principal engineer articulates the core lifecycle, asynchronous queue dispatching, and memory profiling.`,
        };
      } else {
        feedback = {
          accuracyScore: 5,
          clarityScore: 5,
          strengths: ['Identified general concepts related to the question'],
          improvements: [
            'Needs deeper technical depth rather than high-level surface statements',
            'Explain concrete examples and trade-offs rather than generic definitions',
          ],
          idealAnswer: `For "${targetQ.questionText}", address the exact sequence of execution, internal data structures, and edge-case handling.`,
        };
      }
    }

    targetQ.userAnswer = userAnswer;
    targetQ.answerType = answerType;
    targetQ.timeSpentSeconds = timeSpentSeconds;
    targetQ.feedback = feedback;
    targetQ.answeredAt = new Date();

    const isLastQuestion = questionIndex + 1 >= session.totalQuestions;
    let nextQuestion = null;

    if (!isLastQuestion && questions.length === questionIndex + 1) {
      // Generate Next Question dynamically ensuring uniqueness & role relevance
      const nextQNum = questionIndex + 2;
      const stackStr = session.techStack.join(', ');
      const askedQuestionsList = questions.map((q, i) => `${i + 1}. "${q.questionText}"`).join('\n');

      if (getGeminiClient()) {
        const nextQPrompt = `
You are a Principal Technical Interviewer conducting a realistic, rigorous technical interview for a ${session.seniority} ${session.role} (Stack: ${stackStr}).
This is Question #${nextQNum} of ${session.totalQuestions}.

Previously Asked Questions in this session:
${askedQuestionsList}

Previous Candidate Performance: Accuracy ${feedback.accuracyScore}/10 on question: "${targetQ.questionText}".

Requirements for Question #${nextQNum}:
1. CRITICAL: You MUST NOT repeat, overlap, or rephrase any of the previously asked questions listed above.
2. Formulate a BRAND NEW, HIGH-IMPACT, practical interview question testing a different core technical dimension (e.g. system design, edge cases, error handling, performance tuning, architecture, or deep language mechanics) of ${stackStr}.
3. The question must strictly test real engineering problem solving suitable for a ${session.seniority} level.

Return JSON in this exact schema:
{
  "questionText": "Clear, precise technical interview question",
  "category": "Theory / Coding / System Design / Scenario",
  "difficulty": "Easy / Medium / Hard"
}
`;
        try {
          nextQuestion = await generateAIJSON(nextQPrompt, 'You are an elite principal technical interviewer. Return JSON only.');
        } catch (err) {
          console.warn('⚠️ [Service] Next question generation failed, using fallback:', err.message);
        }
      }

      if (!nextQuestion || !nextQuestion.questionText) {
        nextQuestion = getRandomUniqueQuestion(session.role, questions);
      }

      questions.push({
        questionId: nextQNum,
        questionText: nextQuestion.questionText,
        category: nextQuestion.category || 'Technical',
        difficulty: nextQuestion.difficulty || 'Medium',
        userAnswer: '',
        answerType: 'text',
        timeSpentSeconds: 0,
        feedback: {},
      });
    }

    const nextIndex = isLastQuestion ? questionIndex : questionIndex + 1;
    const updated = await interviewRepository.updateSession(sessionId, {
      questions,
      currentQuestionIndex: nextIndex,
    });

    return {
      feedback,
      isLastQuestion,
      nextQuestionIndex: nextIndex,
      nextQuestion: isLastQuestion ? null : questions[nextIndex],
      session: updated,
    };
  },

  /**
   * Finalize the interview session and generate the comprehensive scorecard
   */
  async finalizeInterview({ sessionId }) {
    const session = await interviewRepository.findBySessionId(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }

    const questions = session.questions || [];
    const answered = questions.filter((q) => q.feedback && typeof q.feedback.accuracyScore === 'number');
    const wasConcludedEarly = answered.length < session.totalQuestions;

    let finalReport = null;

    if (getGeminiClient() && answered.length > 0) {
      const summaryList = answered
        .map(
          (q, i) =>
            `Q${i + 1}: ${q.questionText}\nCandidate Answer: "${q.userAnswer}"\nAccuracy: ${q.feedback?.accuracyScore}/10, Clarity: ${q.feedback?.clarityScore}/10\nStrengths: ${q.feedback?.strengths?.join(', ')}\nImprovements: ${q.feedback?.improvements?.join(', ')}`
        )
        .join('\n\n');

      const prompt = `
You are a Principal Engineering Director & Bar Raiser generating a comprehensive hiring evaluation for a candidate.
Role: ${session.seniority} ${session.role}
Target Tech Stack: ${session.techStack.join(', ')}
Attempted Questions: ${answered.length} of ${session.totalQuestions} ${wasConcludedEarly ? '(Candidate concluded interview session early)' : '(Full Session Completed)'}

Interview Transcript & Step Evaluated Answers:
${summaryList}

Provide a detailed, constructive final hiring assessment in this exact JSON schema:
{
  "overallScore": 82, // Integer 0-100 (evaluate objectively based on attempted answers)
  "grade": "Ready to Hire" | "Solid Competence with Polish" | "Needs Dedicated Revision",
  "technicalScore": 85, // Integer 0-100
  "communicationScore": 80, // Integer 0-100
  "summary": "3-4 sentence holistic evaluation of the candidate's core technical abilities, articulation, and readiness for a ${session.seniority} ${session.role}.",
  "topStrengths": [
    "Specific strong concept or solution they articulated well 1",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "criticalGaps": [
    "Specific technical issue, edge-case or misconception observed in their answers 1",
    "Specific technical area where they lacked depth 2"
  ],
  "suggestedTopics": [
    "Actionable roadmap item / topic / pattern to study 1",
    "Actionable study topic 2",
    "Actionable study topic 3"
  ],
  "answeredCount": ${answered.length},
  "totalCount": ${session.totalQuestions},
  "wasConcludedEarly": ${wasConcludedEarly}
}
`;
      try {
        finalReport = await generateAIJSON(prompt, 'You are an executive engineering hiring bar raiser. Return JSON only.');
      } catch (err) {
        console.warn('⚠️ [Service] Final report AI generation failed, using fallback:', err.message);
      }
    }

    if (!finalReport || typeof finalReport.overallScore !== 'number') {
      // Calculate algorithmic scores from answers (handling 0 properly)
      const totalAccuracy = answered.reduce((acc, q) => acc + (typeof q.feedback?.accuracyScore === 'number' ? q.feedback.accuracyScore : 0), 0);
      const totalClarity = answered.reduce((acc, q) => acc + (typeof q.feedback?.clarityScore === 'number' ? q.feedback.clarityScore : 0), 0);
      const avgAccuracy = answered.length > 0 ? Math.round((totalAccuracy / (answered.length * 10)) * 100) : 0;
      const avgClarity = answered.length > 0 ? Math.round((totalClarity / (answered.length * 10)) * 100) : 0;
      const overall = Math.round((avgAccuracy * 0.6) + (avgClarity * 0.4));

      let grade = 'Needs Dedicated Revision';
      let summary = '';
      let topStrengths = [];
      let criticalGaps = [];

      const earlyNote = wasConcludedEarly ? ` (Session concluded early after ${answered.length} of ${session.totalQuestions} questions)` : '';

      if (overall >= 80) {
        grade = 'Ready to Hire (Strong Candidate)';
        summary = `The candidate demonstrated strong mastery and execution across ${answered.length} question(s)${earlyNote}. Articulated mechanics clearly and demonstrated solid engineering maturity for a ${session.seniority} ${session.role}.`;
        topStrengths = [
          'Solid grasp of core engineering architecture, lifecycle, and syntax',
          'Structured, coherent technical communication',
          'Good awareness of performance trade-offs and best practices',
        ];
        criticalGaps = [
          'Further elaborate on high-scale distributed failure modes',
          'Include deeper profiling and observability insights in production',
        ];
      } else if (overall >= 50) {
        grade = 'Solid Competence with Polish';
        summary = `The candidate completed ${answered.length} question(s)${earlyNote}. Demonstrated foundational understanding for a ${session.seniority} ${session.role}, but showed opportunities to deepen system edge-cases and runtime mechanisms.`;
        topStrengths = [
          'Understands high-level concepts and terminology',
          'Attempted structured responses across key areas',
        ];
        criticalGaps = [
          'Needs deeper technical depth rather than surface definitions',
          'Explain concrete edge-cases, memory handling, and concurrency trade-offs',
        ];
      } else {
        grade = 'Needs Significant Technical Revision';
        summary = `The candidate completed ${answered.length} question(s)${earlyNote}. Responses were incomplete, off-topic, or lacked accurate technical substance required for a ${session.seniority} ${session.role}.`;
        topStrengths = [
          answered.length > 0 ? 'Participated in the interview session' : 'Session initiated',
        ];
        criticalGaps = [
          'Responses lacked technical accuracy, mechanisms, and core domain knowledge',
          'Random, incomplete, or off-topic answers provided during the session',
        ];
      }

      finalReport = {
        overallScore: overall,
        grade,
        technicalScore: avgAccuracy,
        communicationScore: avgClarity,
        summary,
        topStrengths,
        criticalGaps,
        suggestedTopics: [
          'Core fundamentals, runtime lifecycles & concurrency models',
          'Production debugging, profiling, and error resilience',
          'Clean architecture patterns & secure API design',
        ],
        answeredCount: answered.length,
        totalCount: session.totalQuestions,
        wasConcludedEarly,
      };
    }

    const updated = await interviewRepository.updateSession(sessionId, {
      status: 'completed',
      finalReport,
    });

    return updated;
  },

  /**
   * Get single session details
   */
  async getSessionById(sessionId) {
    const session = await interviewRepository.findBySessionId(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }
    return session;
  },

  /**
   * Get recent interview sessions
   */
  async getRecentHistory(limit = 10, userId = null) {
    return await interviewRepository.findRecent(Number(limit) || 10, userId);
  },
};
