import express, { type Express, type Request, type Response } from 'express';
import path from 'node:path';
import { authRoutes } from './presentation/routes/AuthRoutes.js';
import { profileRoutes, publicProfileRoutes } from './presentation/routes/ProfileRoutes.js';

export const app: Express = express();
//-----------------------------------------------------------------------------------------------------------
const uploadsDirectory = path.resolve(process.cwd(), 'uploads');

app.set('trust proxy', true);
app.use(express.json());
// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDirectory));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'This the API BACKEND' });
});

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ API routes ----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/auth', authRoutes);

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Profile routes ------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/auth/profile', profileRoutes);
app.use('/api/profile', publicProfileRoutes);