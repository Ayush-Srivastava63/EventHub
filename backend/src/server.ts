import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ───
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ─── API Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// ─── Centralized Error Handler (must be last) ───
app.use(errorHandler);

// ─── Start Server ───
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
