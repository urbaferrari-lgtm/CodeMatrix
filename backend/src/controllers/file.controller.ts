import { Response } from 'express';
import { FileService } from '../services/file.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export class FileController {
  static async getFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = req.params.projectId as string;
      const files = await FileService.getProjectFiles(projectId, req.user!.userId);
      if (!files) {
        sendError(res, 'Project not found', 404);
        return;
      }
      sendSuccess(res, files);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const file = await FileService.createFile(req.user!.userId, {
        ...req.body,
        project: req.body.projectId,
      });
      if (!file) {
        sendError(res, 'Project not found or write access denied', 404);
        return;
      }
      sendSuccess(res, file, 'File created', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  static async updateContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const fileId = req.params.fileId as string;
      const file = await FileService.updateContent(fileId, req.user!.userId, req.body.content);
      if (!file) {
        sendError(res, 'File not found or write access denied', 404);
        return;
      }
      sendSuccess(res, file, 'File saved');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const fileId = req.params.fileId as string;
      const file = await FileService.deleteFile(fileId, req.user!.userId);
      if (!file) {
        sendError(res, 'File not found or write access denied', 404);
        return;
      }
      sendSuccess(res, null, 'File deleted');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
