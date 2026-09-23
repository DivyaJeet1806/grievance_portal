import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, getDBStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check with Database Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'GrievanceHub Node.js API Service with MongoDB & JWT Security',
    database: getDBStatus(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Initialize database connection and start HTTP server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 GrievanceHub API Server Running`);
    console.log(`🔒 JWT Authentication Active`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

startServer();

