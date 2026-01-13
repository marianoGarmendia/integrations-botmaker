import { Router } from 'express';
import { getSaludo } from '../controllers/ejemplo.controller.mjs';

export const ejemploRouter = Router();

ejemploRouter.get('/', getSaludo);
