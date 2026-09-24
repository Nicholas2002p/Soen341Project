import express, { type Express, type Request, type Response } from 'express';

export const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('This the API BACKEND');
});

//--------------------------------------------------------------------------------------------------------------------------------------
//---------------------------  Authentication Endpoints  -------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

// Authentication endpoint
app.get('/api/auth/me', (req: Request, res: Response) => {
  res.send('Authentication endpoint');
});
// Register endpoint
app.post('/api/auth/register', (req: Request, res: Response) => {
  res.send('Register endpoint');
});
// Login endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  res.send('Login endpoint');
});
// Logout endpoint
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.send('Logout endpoint');
});

//--------------------------------------------------------------------------------------------------------------------------------------
//---------------------------  Profile Endpoints  --------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

// Get profile endpoint
app.get('/api/auth/profile', (req: Request, res: Response) => {
  res.send('Get profile endpoint');
});
// Update profile endpoint
app.put('/api/auth/profile', (req: Request, res: Response) => {
  res.send('Update profile endpoint');
});

app.listen(3000);