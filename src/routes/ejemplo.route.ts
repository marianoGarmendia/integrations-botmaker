import { Router } from 'express';
import { getSaludo } from '../controllers/ejemplo.controller';

export const ejemploRouter = Router();

ejemploRouter.get('/', getSaludo);
