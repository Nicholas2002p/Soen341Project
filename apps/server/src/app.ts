import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { authRoutes } from './presentation/routes/AuthRoutes.js';
import { profileRoutes, publicProfileRoutes } from './presentation/routes/ProfileRoutes.js';
import { resumeRoutes } from './presentation/routes/ResumeRoutes.js';
import cors from 'cors';

export const app: Express = express();
app.set('trust proxy', true);
app.use(cors({
  origin: ["http://localhost:5173", "https://localhost:5173"],
  credentials: true, // needed if you send cookies or auth headers cross-origin
}));
app.use(express.json());

// Profile pictures are public; resume files must remain behind the authenticated download route.
const profilePicturesDirectory = path.resolve(process.cwd(), 'uploads', 'profile-pictures');
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

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Profile routes ------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/auth/profile', profileRoutes);
app.use('/api/profile', publicProfileRoutes);