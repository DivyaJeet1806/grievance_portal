import express from 'express';
import {
  getGrievances,
  getGrievanceById,
  createGrievance,
  updateGrievance,
  rateGrievance,
  confirmResolution,
  getAnalytics,
  resetDatabase
} from '../controllers/grievanceController.js';
import { verifyToken, requireRole, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Read routes
router.get('/analytics', getAnalytics);
router.get('/', getGrievances);
router.get('/:id', getGrievanceById);

// Complainant & Department actions
router.post('/', optionalAuth, createGrievance);
router.post('/:id/rating', rateGrievance);
router.post('/:id/confirm-resolution', optionalAuth, confirmResolution);

// Protected Admin Actions (JWT + Admin role mandatory)
router.patch('/:id', verifyToken, requireRole('admin'), updateGrievance);
router.post('/reset', verifyToken, requireRole('admin'), resetDatabase);

export default router;

