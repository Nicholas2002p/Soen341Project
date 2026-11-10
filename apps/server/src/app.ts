import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { authRoutes } from './presentation/routes/AuthRoutes.js';
import { profileRoutes, publicProfileRoutes } from './presentation/routes/ProfileRoutes.js';
import { resumeRoutes } from './presentation/routes/ResumeRoutes.js';
import { applicationRoutes } from './presentation/routes/ApplicationRoutes.js';
import { companyRoutes } from './presentation/routes/CompanyRoutes.js';
import { jobRoutes } from './presentation/routes/JobRoutes.js';
import { savedJobRoutes } from './presentation/routes/SavedJobRoutes.js';
import cors from 'cors';

export const app: Express = express();

const frontendUrl = process.env.FRONTEND_URL;

const allowedOrigins = [
    'http://localhost:5173',
    'https://localhost:5173',
    ...(frontendUrl ? [frontendUrl] : []),
];

app.set('trust proxy', true);
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());

const uploadsDirectory = path.resolve(process.cwd(), 'uploads');
const profilePicturesDirectory = path.resolve(process.cwd(), 'uploads', 'profile-pictures');

if (process.env.NODE_ENV === 'test') {
  app.use('/uploads', express.static(uploadsDirectory));
}

// Profile pictures are public; resume files must remain behind the authenticated download route.
app.use('/uploads/profile-pictures', express.static(profilePicturesDirectory));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'This the API BACKEND' });
});

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ API routes ----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/auth', authRoutes);

//-----------------------------------------------------------------------------------------------------------
//------------------------------------------- Resume routes ------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/resumes', resumeRoutes);
app.use('/api/applications', applicationRoutes);

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Profile routes ------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/auth/profile', profileRoutes);
app.use('/api/profile', publicProfileRoutes);

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Job routes ------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/saved-jobs', savedJobRoutes);