import mongoose, { Document, Schema } from 'mongoose';

export interface ICollaboration extends Document {
  project: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    socketId: string;
    cursor?: { line: number; column: number };
    color: string;
    joinedAt: Date;
  }[];
  updatedAt: Date;
}

const collaborationSchema = new Schema<ICollaboration>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        socketId: { type: String, required: true },
        cursor: {
          line: { type: Number, default: 0 },
          column: { type: Number, default: 0 },
        },
        color: { type: String, default: '#22D472' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Collaboration = mongoose.model<ICollaboration>('Collaboration', collaborationSchema);

