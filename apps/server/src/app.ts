import express, { type Express, type Request, type Response } from 'express';

export const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('This the API BACKEND');
});

app.listen(3000);