import express, { type Express, type Request, type Response } from 'express';
import { authRoutes } from './presentation/routes/AuthRoutes.js';
import { profileRoutes, publicProfileRoutes } from './presentation/routes/ProfileRoutes.js';
import { resumeRoutes } from './presentation/routes/ResumeRoutes.js';
import cors from 'cors';

export const app: Express = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'This the API BACKEND' });
});

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ API routes ----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Profile routes ------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/auth/profile', profileRoutes);
app.use('/api/profile', publicProfileRoutes);