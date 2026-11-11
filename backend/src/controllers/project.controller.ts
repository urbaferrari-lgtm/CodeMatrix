import { Response } from 'express';
import { ProjectService } from '../services/project.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export class ProjectController {
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const project = await ProjectService.create(req.user!.userId, req.body);
      sendSuccess(res, project, 'Project created', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projects = await ProjectService.getUserProjects(req.user!.userId);
      sendSuccess(res, projects);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = req.params.id as string;
      const project = await ProjectService.getById(projectId, req.user!.userId);
      if (!project) {
        sendError(res, 'Project not found', 404);
        return;
      }
      sendSuccess(res, project);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
