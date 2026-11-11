import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register(name, email, password);

      sendSuccess(res, result, 'Registration successful. Please check your email for the verification code.', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      await AuthService.verifyEmail(email, otp);
      sendSuccess(res, null, 'Email verified successfully');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  static async resendVerificationOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await AuthService.resendVerificationOtp(email);
      sendSuccess(res, null, 'If the account is unverified, a new code has been sent.');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await AuthService.requestPasswordReset(email);
      sendSuccess(res, null, 'If an account exists for this email, a password reset code has been sent.');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, password } = req.body;
      await AuthService.resetPassword(email, otp, password);
      sendSuccess(res, null, 'Password reset successfully. You can now sign in with your new password.');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
    } catch (err: any) {
      sendError(res, err.message, 401);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Logged out successfully');
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    sendSuccess(res, req.user, 'Current user loaded');
  }
}
