import jwt from 'jsonwebtoken';
import { findUserById } from '../models/userStore.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'grievancehub_secure_super_jwt_secret_token_2026_xyz';

// Verify JWT token middleware
export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing or malformed Authorization header (Bearer token required).'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User account no longer exists.'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired JWT token.',
      error: err.message
    });
  }
}

// Optional Auth (for lodging grievances: supports both logged-in users and anonymous guests)
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);
    if (user) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      };
    }
  } catch (e) {
    // Ignore invalid optional token
  }
  next();
}

// Role-based Access Control (RBAC) middleware
export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires [${requiredRole}] administrative privileges.`
      });
    }

    next();
  };
}
