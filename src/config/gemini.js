import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

/**
 * Generate structured JSON response from Gemini
 */
export const generateAIJSON = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!ai || !apiKey) {
    console.warn('⚠️ [AI] GEMINI_API_KEY not configured. Falling back to built-in generator.');
    return null;
  }

  if (!apiKey.startsWith('AIzaSy')) {
    console.warn('⚠️ [AI] Note: Standard Google AI Studio keys start with "AIzaSy...". Current key might be an OAuth token.');
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || 'You are an elite principal technical interviewer. Always return valid JSON only without markdown code blocks.',
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text?.trim() || '';
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.warn('⚠️ [AI] Gemini API Generation failed (using intelligent fallback):', error.message);
    return null;
  }
};
