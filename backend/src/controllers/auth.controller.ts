import { Response } from 'express';
import pool from '../config/database';;
import crypto from 'crypto';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  isValidEmail,
  isValidPassword,
  sanitizeUser,
} from '../utils/auth.utils';;
import {
  User,
  UserRole,
  RefreshToken,
  AuthResponse,
  RefreshResponse,
} from '../types/auth.types';;

/**
 * Get cookie options for refresh token based on environment
 */
function getCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge?: number;
} {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = process.env.COOKIE_SECURE === 'true' || isProduction;
  const sameSite = (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') || 'lax';
  const domain = process.env.COOKIE_DOMAIN || undefined;

  return {
    httpOnly: true,
    secure,
    sameSite,
    ...(domain && { domain }),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: any, res: Response): Promise<void> {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'All fields are required: email, password, first_name, last_name',
      });
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid email format',
      });
      return;
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Password does not meet requirements',
        details: passwordValidation.errors,
      });
      return;
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase().trim(),
    ]);

    if (existingUser.rows.length > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Email already registered',
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with default role 'user'
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, avatar_url, role, created_at, updated_at`,
      [
        email.toLowerCase().trim(),
        passwordHash,
        first_name.trim(),
        last_name.trim(),
        UserRole.USER,
      ],
    );

    const user = userResult.rows[0] as User;

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id, user.email, user.role);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt],
    );

    // Set refresh token as HTTP-only cookie
    const cookieOptions = getCookieOptions();

    res
      .status(201)
      .json({
        user: sanitizeUser(user),
        accessToken,
      } as AuthResponse)
      .cookie('refresh_token', refreshToken, cookieOptions);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Registration failed',
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: any, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
      return;
    }

    // Find user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [
      email.toLowerCase().trim(),
    ]);

    if (userResult.rows.length === 0) {
      // Generic error message to prevent email enumeration
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
      return;
    }

    const user = userResult.rows[0] as User;

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate new refresh token
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);

    // Revoke all existing refresh tokens for this user
    await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [user.id]);

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt],
    );

    // Set refresh token as HTTP-only cookie
    const cookieOptions = getCookieOptions();

    res
      .json({
        user: sanitizeUser(user),
        accessToken,
      } as AuthResponse)
      .cookie('refresh_token', refreshToken, cookieOptions);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed',
    });
  }
}

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 * Refresh token is read from cookie (not request body)
 */
export async function refresh(req: any, res: Response): Promise<void> {
  try {
    const { refresh_token } = req.cookies as { refresh_token?: string };

    if (!refresh_token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No refresh token provided',
      });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refresh_token);

    // Check if token exists in database and is not revoked
    const tokenResult = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [
      refresh_token,
    ]);

    if (tokenResult.rows.length === 0 || tokenResult.rows[0].revoked) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token',
      });
      return;
    }

    const storedToken = tokenResult.rows[0] as RefreshToken;

    // Check if token expired
    if (storedToken.expires_at < new Date()) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token expired',
      });
      return;
    }

    // Fetch user from database
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, avatar_url, role, created_at, updated_at FROM users WHERE id = $1',
      [payload.userId],
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
      });
      return;
    }

    const user = userResult.rows[0] as User;

    // Token rotation: Revoke old token and create new one
    await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [storedToken.id]);

    const newRefreshToken = generateRefreshToken(user.id, user.email, user.role);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, newRefreshToken, newExpiresAt],
    );

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set new refresh token in cookie
    const cookieOptions = getCookieOptions();

    res
      .json({
        accessToken,
      } as RefreshResponse)
      .cookie('refresh_token', newRefreshToken, cookieOptions);
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token',
      });
      return;
    }

    console.error('Refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Token refresh failed',
    });
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(req: any, res: Response): Promise<void> {
  try {
    const { refresh_token } = req.cookies as { refresh_token?: string };

    if (refresh_token) {
      // Revoke the refresh token
      await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1', [
        refresh_token,
      ]);
    }

    // Clear cookie
    const cookieOptions = {
      ...getCookieOptions(),
      maxAge: 0, // Expire immediately
      expires: new Date(0),
    };

    res.json({ message: 'Logged out successfully' }).clearCookie('refresh_token', cookieOptions);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Logout failed',
    });
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function me(req: any, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
      return;
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user',
    });
  }
}
