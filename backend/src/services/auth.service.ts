import bcrypt from 'bcryptjs';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { env } from '../config/env';
import { EmailService } from './email.service';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken } from '../utils/jwt';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  preferences?: any;
}

export class AuthService {
  private static hashVerificationOtp(otp: string): string {
    return createHmac('sha256', env.JWT_ACCESS_SECRET).update(otp).digest('hex');
  }

  private static hashPasswordResetOtp(otp: string): string {
    return createHmac('sha256', env.JWT_ACCESS_SECRET).update(`password-reset:${otp}`).digest('hex');
  }

  private static async issueVerificationOtp(user: InstanceType<typeof User>): Promise<void> {
    const otp = randomInt(100000, 1000000).toString();
    user.emailVerificationOtpHash = this.hashVerificationOtp(otp);
    user.emailVerificationExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();
    await EmailService.sendVerificationOtp(user.email, otp);
  }

  static async register(name: string, email: string, password: string): Promise<{ user: UserResponseDTO }> {
    email = normalizeEmail(email);
    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'user',
      isEmailVerified: false,
    });

    try {
      await this.issueVerificationOtp(user);
    } catch (error) {
      await user.deleteOne();
      throw error;
    }

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  static async verifyEmail(email: string, otp: string): Promise<void> {
    email = normalizeEmail(email);
    const user = await User.findOne({ email })
      .select('+emailVerificationOtpHash +emailVerificationExpires');

    if (!user || user.isEmailVerified || !user.emailVerificationOtpHash || !user.emailVerificationExpires) {
      throw new Error('Invalid or expired verification code');
    }

    const submittedHash = Buffer.from(this.hashVerificationOtp(otp), 'hex');
    const savedHash = Buffer.from(user.emailVerificationOtpHash, 'hex');
    if (
      user.emailVerificationExpires.getTime() <= Date.now() ||
      savedHash.length !== submittedHash.length ||
      !timingSafeEqual(savedHash, submittedHash)
    ) {
      throw new Error('Invalid or expired verification code');
    }

    user.isEmailVerified = true;
    user.emailVerificationOtpHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  static async resendVerificationOtp(email: string): Promise<void> {
    email = normalizeEmail(email);
    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) {
      return;
    }
    await this.issueVerificationOtp(user);
  }

  static async requestPasswordReset(email: string): Promise<void> {
    email = normalizeEmail(email);
    const user = await User.findOne({ email });
    if (!user) {
      return;
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = this.hashPasswordResetOtp(otp);
    user.passwordResetOtpHash = otpHash;
    user.passwordResetExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    try {
      await EmailService.sendPasswordResetOtp(user.email, otp);
    } catch (error) {
      await User.updateOne(
        { _id: user._id, passwordResetOtpHash: otpHash },
        { $unset: { passwordResetOtpHash: 1, passwordResetExpires: 1 } },
      );
      throw error;
    }
  }

  static async resetPassword(email: string, otp: string, password: string): Promise<void> {
    email = normalizeEmail(email);
    const user = await User.findOne({ email })
      .select('+passwordResetOtpHash +passwordResetExpires');
    if (!user || !user.passwordResetOtpHash || !user.passwordResetExpires) {
      throw new Error('Invalid or expired password reset code');
    }

    const submittedHash = Buffer.from(this.hashPasswordResetOtp(otp), 'hex');
    const savedHash = Buffer.from(user.passwordResetOtpHash, 'hex');
    if (
      user.passwordResetExpires.getTime() <= Date.now() ||
      savedHash.length !== submittedHash.length ||
      !timingSafeEqual(savedHash, submittedHash)
    ) {
      throw new Error('Invalid or expired password reset code');
    }

    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(12));
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        passwordResetOtpHash: user.passwordResetOtpHash,
        passwordResetExpires: { $gt: new Date() },
      },
      {
        $set: { passwordHash },
        $unset: { passwordResetOtpHash: 1, passwordResetExpires: 1 },
      },
    );
    if (!updatedUser) {
      throw new Error('Invalid or expired password reset code');
    }
  }

  static async login(email: string, password: string): Promise<{ user: UserResponseDTO; accessToken: string; refreshToken: string }> {
    email = normalizeEmail(email);
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
      },
      accessToken,
      refreshToken,
    };
  }
}
