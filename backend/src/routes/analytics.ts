import express from 'express';
import { getAnalyticsOverview } from '../controllers/analyticsController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/overview', verifyToken, getAnalyticsOverview);

export default router;
