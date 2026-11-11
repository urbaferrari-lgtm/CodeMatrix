import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  path: string;
  content?: string;
  fileType: 'file' | 'folder';
  parent?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true },
    path: { type: String, required: true },
    content: { type: String, default: '' },
    fileType: { type: String, enum: ['file', 'folder'], required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'File' },
  },
  { timestamps: true }
);

fileSchema.index({ project: 1, path: 1 }, { unique: true });

export const File = mongoose.model<IFile>('File', fileSchema);

