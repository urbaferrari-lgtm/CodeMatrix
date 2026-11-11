import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: env.EMAIL_USER,
      clientId: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET,
      refreshToken: env.REFRESH_TOKEN,
    },
  });

  static get isConfigured(): boolean {
    return !!(env.EMAIL_USER && env.CLIENT_ID && env.CLIENT_SECRET && env.REFRESH_TOKEN);
  }

  static async verifyConnection(): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Email is not configured. Set CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, and EMAIL_USER in backend/.env.');
    }
    await this.transporter.verify();
  }

  private static get fromAddress(): string {
    const from = env.EMAIL_USER;
    if (!from) {
      throw new Error('Email sender is not configured. Set EMAIL_USER in backend/.env.');
    }
    return from;
  }

  static async sendVerificationOtp(to: string, otp: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Email is not configured. Set CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, and EMAIL_USER in backend/.env.');
    }

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'Your CodeMatrix verification code',
      text: `Your CodeMatrix verification code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your CodeMatrix verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
    });
  }

  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    if (!env.EMAIL_USER) {
      console.log(`[Email Mock] Welcome email queued for ${to}`);
      return;
    }
    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'Welcome to CodeMatrix AI Editor',
      html: `<h1>Welcome, ${name}!</h1><p>Your CodeMatrix developer account is active.</p>`,
    });
  }

  static async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Email is not configured. Set CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, and EMAIL_USER in backend/.env.');
    }

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'Your CodeMatrix password reset code',
      text: `Your CodeMatrix password reset code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your CodeMatrix password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
    });
  }
}
