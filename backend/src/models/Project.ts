import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  language: string;
  template?: string;
  visibility: 'public' | 'private';
  collaborators: {
    user: mongoose.Types.ObjectId;
    permission: 'read' | 'write' | 'admin';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    language: { type: String, required: true, default: 'typescript' },
    template: { type: String },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    collaborators: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        permission: { type: String, enum: ['read', 'write', 'admin'], default: 'write' },
      },
    ],
  },
  { timestamps: true }
);

projectSchema.index({ name: 'text', description: 'text' });

export const Project = mongoose.model<IProject>('Project', projectSchema);

