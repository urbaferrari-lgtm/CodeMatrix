import axios from 'axios';
import { env } from '../../config/env';

export class ExecutionService {
  static async runCode(language: string, code: string): Promise<{ status: string; output: string; duration: number }> {
    const startTime = Date.now();
    const languageIds: Record<string, number> = {
      javascript: 63,
      typescript: 74,
      python: 71,
      cpp: 54,
      java: 62,
      rust: 73,
      go: 60,
    };
    const languageId = languageIds[language.toLowerCase()];

    if (!languageId) {
      throw new Error(`Code execution is not supported for "${language}".`);
    }

    if (!env.JUDGE0_API_KEY || !env.JUDGE0_API_URL) {
      throw new Error('Code execution is unavailable. Configure JUDGE0_API_KEY and JUDGE0_API_URL.');
    }

    try {
      const baseUrl = env.JUDGE0_API_URL.replace(/\/+$/, '');
      const host = new URL(baseUrl).hostname;
      const response = await axios.post(
        `${baseUrl}/submissions?wait=true`,
        {
          source_code: code,
          language_id: languageId,
        },
        {
          headers: {
            'X-RapidAPI-Key': env.JUDGE0_API_KEY,
            ...(host.endsWith('.rapidapi.com') ? { 'X-RapidAPI-Host': host } : {}),
            'Content-Type': 'application/json',
          }
        }
      );
      const result = response.data;
      return {
        status: result.status?.description || 'Unknown',
        output: result.stdout || result.stderr || result.compile_output || 'Process completed without output.',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseBody = error.response?.data;
        const providerMessage =
          typeof responseBody === 'string'
            ? responseBody
            : responseBody && typeof responseBody === 'object'
              ? JSON.stringify(responseBody)
              : undefined;
        const message = providerMessage || error.message;
        throw new Error(`Judge0 request failed${error.response ? ` (${error.response.status})` : ''}: ${message}`);
      }

      const message = error instanceof Error ? error.message : 'Unknown Judge0 error.';
      throw new Error(`Judge0 execution failed: ${message}`);
    }
  }
}
