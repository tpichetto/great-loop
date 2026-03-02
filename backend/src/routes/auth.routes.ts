import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, me } from '../controllers/auth.controller';;
import { authenticate } from '../middleware/auth.middleware';;

const router = Router();

/**
 * Rate limiting for auth endpoints
 * 5 attempts per 15 minutes window
 */
const authRateLimit = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'),
  message: {
    error: 'Too many requests',
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Apply to all auth routes except those that skip it
  skipSuccessfulRequests: false,
});

// Public routes (rate limited)
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/refresh', authRateLimit, refresh);

// Protected routes (require authentication)
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
