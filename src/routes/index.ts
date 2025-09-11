import { Router } from 'express';
import { ejemploRouter } from './ejemplo.route';

const router = Router();

router.use('/ejemplo', ejemploRouter);

export default router;
