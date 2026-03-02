import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { verifyAccessToken } from '../utils/auth.utils';
import { User, UserRole } from '../types/auth.types';;

/**
 * Authenticate user by verifying access token in Authorization header
 * Attaches the user to the request object
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No access token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Fetch user from database (excluding password_hash)
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

    // Attach user to request using type assertion
    (req as any).user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid access token',
      });
      return;
    }

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token expired',
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Authorize user based on role
 * Requires user to be attached to request (via authenticate middleware)
 */
export function authorize(...requiredRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    if (!requiredRoles.includes(user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token provided
 * Still attaches user if token is valid
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      const userResult = await pool.query(
        'SELECT id, email, first_name, last_name, avatar_url, role, created_at, updated_at FROM users WHERE id = $1',
        [payload.userId],
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0] as User;
        (req as any).user = user;
      }
    }

    next();
  } catch {
    // Silently ignore errors for optional auth
    next();
  }
}
