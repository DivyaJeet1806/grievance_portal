import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { connectDB, getDBStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

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

// Serve Vite frontend in production or when dist folder exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Client-side SPA routing fallback: non-API GET requests serve index.html
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// 404 Handler for unhandled API or asset requests
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Initialize HTTP server immediately and connect database in background
function startServer() {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 GrievanceHub API Server Running`);
    console.log(`🔒 JWT Authentication Active`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });

  // Attempt DB connection in background without delaying server startup
  connectDB().catch(err => {
    console.warn('⚠️ [MongoDB] Background connection attempt failed:', err.message);
  });
}

startServer();

