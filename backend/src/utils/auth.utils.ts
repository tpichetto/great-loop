import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID as uuidv4 } from 'crypto';
import dotenv from 'dotenv';
import { JWTPayload, User, UserRole } from '../types/auth.types';;

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback-secret-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-this';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Hash a password using bcrypt with 12 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain password against a hashed password
 */
export async function comparePassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hash);
}

/**
 * Generate an access token (short-lived, 15 minutes)
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  return (jwt as any).sign(
    { ...payload, type: 'access' },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );
}

/**
 * Generate a refresh token (long-lived, 7 days)
 */
export function generateRefreshToken(userId: string, email: string, role: UserRole): string {
  return (jwt as any).sign(
    { userId, email, role, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY, jwtid: uuidv4() }
  );
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  return (jwt as any).verify(token, JWT_ACCESS_SECRET) as JWTPayload;
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload & { jti: string } {
  return (jwt as any).verify(token, JWT_REFRESH_SECRET) as JWTPayload & { jti: string };
}

/**
 * Create a sanitized user object (excludes password_hash)
 */
export function sanitizeUser(user: User): Omit<User, 'password_hash'> {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (min 8 chars, mix of char types)
 */
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
