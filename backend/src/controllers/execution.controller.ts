import { Request, Response } from 'express';
import { ExecutionService } from '../services/execution/execution.service';
import { sendSuccess, sendError } from '../utils/response';

export class ExecutionController {
  static async run(req: Request, res: Response): Promise<void> {
    try {
      const { language, code } = req.body;
      const result = await ExecutionService.runCode(language, code);
      sendSuccess(res, result);
    } catch (err: any) {
      sendError(res, err.message, 502);
    }
  }
}
