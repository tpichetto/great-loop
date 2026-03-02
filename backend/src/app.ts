import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

// Load environment variables
dotenv.config();

// Initialize database connection pool
import './config/database';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies for refresh tokens

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Import routes
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import landmarksRoutes from './routes/landmarks.routes';
import progressRoutes from './routes/progress.routes';
import commentRoutes from './routes/comments.routes';
import userRoutes from './routes/users.routes';

// Versioned API routes (v1)
const apiV1 = express();
apiV1.use('/health', healthRoutes);
apiV1.use('/auth', authRoutes);
apiV1.use('/landmarks', landmarksRoutes);
apiV1.use('/progress', progressRoutes);
apiV1.use('/comments', commentRoutes);
apiV1.use('/users', userRoutes);

app.use('/api/v1', apiV1);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export app for testing and start function
export default app;

// Start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
