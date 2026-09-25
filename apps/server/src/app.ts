import express, { type Express, type Request, type Response } from 'express';
import { authRoutes } from './presentation/routes/AuthRoutes.js';

export const app: Express = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'This the API BACKEND' });
});

app.use('/api/auth', authRoutes);

app.get('/api/auth/me', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Authentication endpoint' });
});

app.get('/api/auth/profile', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Get profile endpoint' });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Update profile endpoint' });
});