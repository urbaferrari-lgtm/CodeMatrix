import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';

export class GeminiService {
  private static genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

  static async generateCode(prompt: string, context?: string): Promise<{ reply: string; code?: string }> {
    if (!this.genAI || !env.GEMINI_API_KEY) {
      // Graceful fallback response when API key is not yet configured in local environment
      return {
        reply: `[Gemini AI Sandbox] Analyzed request: "${prompt}".\n\nTo connect live Google Gemini API, set GEMINI_API_KEY in backend/.env`,
        code: `// Generated with CodeMatrix AI Engine\nexport function solveMatrixProblem() {\n  return "Gemini Engine Ready";\n}`,
      };
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const fullPrompt = `${context ? `Code Context:\n${context}\n\n` : ''}User prompt: ${prompt}\n\nPlease respond with a clear explanation and the code snippet.`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return {
      reply: response.text(),
    };
  }
}
