import mongoose, { Document, Schema } from 'mongoose';

export interface IExecution extends Document {
  user: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  language: string;
  code: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'timeout';
  output?: string;
  errorMessage?: string;
  duration?: number;
  createdAt: Date;
}

const executionSchema = new Schema<IExecution>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'error', 'timeout'],
      default: 'pending',
    },
    output: { type: String },
    errorMessage: { type: String },
    duration: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Execution = mongoose.model<IExecution>('Execution', executionSchema);
