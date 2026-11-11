import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  emailVerificationOtpHash?: string;
  emailVerificationExpires?: Date;
  passwordResetOtpHash?: string;
  passwordResetExpires?: Date;
  refreshTokens: string[];
  preferences: {
    theme: string;
    fontSize: number;
    tabSize: number;
    fontFamily: string;
    wordWrap: boolean;
    minimap: boolean;
    autoSave: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOtpHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetOtpHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokens: [{ type: String, select: false }],
    preferences: {
      theme: { type: String, default: 'codematrix-purple' },
      fontSize: { type: Number, default: 14 },
      tabSize: { type: Number, default: 2 },
      fontFamily: { type: String, default: 'JetBrains Mono' },
      wordWrap: { type: Boolean, default: true },
      minimap: { type: Boolean, default: true },
      autoSave: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
