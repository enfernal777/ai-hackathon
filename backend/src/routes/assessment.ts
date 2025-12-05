import express from 'express';
import { getUploadUrl, processFile, getDepartments } from '../controllers/assessmentController';
import { handlePreAssessment, getPostAssessment, submitAssessment } from '../controllers/assessmentFlowController';

const router = express.Router();

router.post('/upload-url', getUploadUrl);
router.post('/process', processFile);
router.get('/departments', getDepartments);

// Employee Flow Routes
router.post('/pre-assessment', handlePreAssessment);
router.get('/post-assessment/:scenarioId', getPostAssessment);
router.post('/submit', submitAssessment);

export default router;
