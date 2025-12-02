import express from 'express';
import { getDashboardStats, getAllEmployees, getEmployeeDetails } from '../controllers/employeeController';
import { verifyToken as authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.get('/dashboard', authenticateToken, getDashboardStats);
router.get('/all', authenticateToken, getAllEmployees);
router.get('/:id/details', authenticateToken, getEmployeeDetails);

export default router;
