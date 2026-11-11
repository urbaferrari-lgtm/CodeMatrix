import { Request, Response } from 'express';
import { GeminiService } from '../services/ai/gemini.service';
import { sendSuccess, sendError } from '../utils/response';

export class AIController {
  static async generate(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, context } = req.body;
      const result = await GeminiService.generateCode(prompt, context);
      sendSuccess(res, result);
    } catch (err: any) {
      sendError(res, err.message, 502);
    }
  }
}
