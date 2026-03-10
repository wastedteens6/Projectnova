import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { nanoid } from 'nanoid';
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from './email.service';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Register a new user
 */
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const { name, email, password } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Check if email verification is required
  const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
  
  // Generate verification token only if required
  const verificationToken = requireEmailVerification ? nanoid(32) : null;

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      verificationToken,
      emailVerified: !requireEmailVerification, // Auto-verify if not required
    },
  });

  // Send verification email only if required
  if (requireEmailVerification) {
    try {
      await sendVerificationEmail(name, email, verificationToken!);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw - user is created, just email failed
    }
  }

  // Send welcome email
  try {
    await sendWelcomeEmail(name, email);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
  };
}

/**
 * Verify user email with token
 */
export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  if (user.emailVerified) {
    throw new Error('Email already verified');
  }

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null, // Clear token after use
    },
  });

  return { message: 'Email verified successfully' };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists for security
    return { message: 'If an account exists, a reset link has been sent' };
  }

  // Generate reset token
  const resetToken = nanoid(32);
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Save token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  // Send reset email
  try {
    await sendPasswordResetEmail(user.name, email, resetToken);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send reset email');
  }

  return { message: 'Password reset link sent to your email' };
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gte: new Date(), // Token not expired
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  // Send confirmation email
  try {
    await sendPasswordChangedEmail(user.name, user.email);
  } catch (error) {
    console.error('Failed to send password changed email:', error);
  }

  return { message: 'Password reset successfully' };
}

/**
 * Change password (for authenticated users)
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Send confirmation email
  try {
    await sendPasswordChangedEmail(user.name, user.email);
  } catch (error) {
    console.error('Failed to send password changed email:', error);
  }

  return { message: 'Password changed successfully' };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      emailVerified: true,
    },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });
}
