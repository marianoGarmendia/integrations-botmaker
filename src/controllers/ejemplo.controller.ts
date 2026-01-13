import { Request, Response } from 'express';

export const getSaludo = (req: Request, res: Response) => {
  res.json({ mensaje: 'Hola desde el controlador 🚀' });
};

// Filtrar por codigo de area para chascomus / brandsen / la plata 