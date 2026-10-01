import express, { type Express, type Request, type Response } from 'express';
import path from 'node:path';
import { authRoutes } from './presentation/routes/AuthRoutes.js';
import { profileRoutes, publicProfileRoutes } from './presentation/routes/ProfileRoutes.js';
import { resumeRoutes } from './presentation/routes/ResumeRoutes.js';
import cors from 'cors';

export const app: Express = express();
//-----------------------------------------------------------------------------------------------------------
const uploadsDirectory = path.resolve(process.cwd(), 'uploads');

app.set('trust proxy', true);
app.use(cors());
app.use(cors({
  origin: "http://localhost:5173", // your frontend's actual origin — must match protocol + port exactly
  credentials: true, // needed if you send cookies or auth headers cross-origin
}));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDirectory));

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
app.use('/api/resumes', resumeRoutes);

//-----------------------------------------------------------------------------------------------------------
// ------------------------------------------ Profile routes ------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
app.use('/api/auth/profile', profileRoutes);
app.use('/api/profile', publicProfileRoutes);