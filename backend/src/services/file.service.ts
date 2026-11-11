import { File, IFile } from '../models/File';
import mongoose from 'mongoose';
import { ProjectService } from './project.service';

export class FileService {
  static async getProjectFiles(projectId: string, userId: string): Promise<IFile[] | null> {
    if (!await ProjectService.canAccess(projectId, userId)) {
      return null;
    }

    return File.find({ project: new mongoose.Types.ObjectId(projectId) }).sort({ fileType: -1, name: 1 });
  }

  static async createFile(userId: string, data: Partial<IFile>): Promise<IFile | null> {
    if (!data.project || !await ProjectService.canAccess(data.project.toString(), userId, true)) {
      return null;
    }

    return File.create(data);
  }

  static async updateContent(fileId: string, userId: string, content: string): Promise<IFile | null> {
    if (!mongoose.isValidObjectId(fileId)) {
      return null;
    }
    const file = await File.findById(fileId).select('project');
    if (!file || !await ProjectService.canAccess(file.project.toString(), userId, true)) {
      return null;
    }

    return File.findByIdAndUpdate(fileId, { content }, { new: true });
  }

  static async deleteFile(fileId: string, userId: string): Promise<IFile | null> {
    if (!mongoose.isValidObjectId(fileId)) {
      return null;
    }
    const file = await File.findById(fileId).select('project');
    if (!file || !await ProjectService.canAccess(file.project.toString(), userId, true)) {
      return null;
    }

    return File.findByIdAndDelete(fileId);
  }
}
