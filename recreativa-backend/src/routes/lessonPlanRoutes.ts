import { Router } from 'express';
import multer from 'multer';
import { multerConfig } from '../config/multer';
import { lessonPlanController } from '../controllers/lessonPlanController';

const router = Router();
const upload = multer(multerConfig);

router.post('/lesson-plans/upload', upload.single('file'), lessonPlanController.uploadAndProcess);

router.get('/lesson-plans', lessonPlanController.getAll);

router.get('/lesson-plans/:id', lessonPlanController.getById);

router.get('/lesson-plans/:id/original-file', lessonPlanController.getOriginalFile);

router.put('/lesson-plans/:id', lessonPlanController.update);

router.get('/lesson-plans/:id/generate-pdf', lessonPlanController.generatePdf);

router.post('/lesson-plans/:id/improve', lessonPlanController.improveWithAI);

router.delete('/lesson-plans/:id', lessonPlanController.deleteById);

export { router as lessonPlanRoutes };