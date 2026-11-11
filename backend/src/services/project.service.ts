import { Project, IProject } from '../models/Project';
import { File } from '../models/File';
import mongoose from 'mongoose';

export class ProjectService {
  static async create(userId: string, data: Partial<IProject>): Promise<IProject> {
    const project = await Project.create({
      ...data,
      owner: new mongoose.Types.ObjectId(userId),
    });

    // Create starter files
    await File.create({
      project: project._id,
      name: 'main.ts',
      path: '/src/main.ts',
      fileType: 'file',
      content: `// Project: ${project.name}\nconsole.log("Welcome to CodeMatrix");\n`,
    });

    return project;
  }

  static async getUserProjects(userId: string): Promise<IProject[]> {
    return Project.find({
      $or: [
        { owner: new mongoose.Types.ObjectId(userId) },
        { 'collaborators.user': new mongoose.Types.ObjectId(userId) },
      ],
    }).sort({ updatedAt: -1 });
  }

  static async getById(projectId: string, userId: string): Promise<IProject | null> {
    if (!mongoose.isValidObjectId(projectId) || !mongoose.isValidObjectId(userId)) {
      return null;
    }

    return Project.findOne({
      _id: new mongoose.Types.ObjectId(projectId),
      $or: [
        { owner: new mongoose.Types.ObjectId(userId) },
        { 'collaborators.user': new mongoose.Types.ObjectId(userId) },
      ],
    });
  }

  static async canAccess(projectId: string, userId: string, write = false): Promise<boolean> {
    if (!mongoose.isValidObjectId(projectId) || !mongoose.isValidObjectId(userId)) {
      return false;
    }

    const project = await Project.findOne({
      _id: new mongoose.Types.ObjectId(projectId),
      $or: [
        { owner: new mongoose.Types.ObjectId(userId) },
        { 'collaborators.user': new mongoose.Types.ObjectId(userId) },
      ],
    }).select('owner collaborators');
    if (!project) {
      return false;
    }

    if (project.owner.equals(userId)) {
      return true;
    }

    const collaboration = project.collaborators.find((item) => item.user.equals(userId));
    return write
      ? collaboration?.permission === 'write' || collaboration?.permission === 'admin'
      : !!collaboration;
  }
}
