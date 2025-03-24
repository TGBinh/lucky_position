import express, { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.use(
  '/',
  createProxyMiddleware({
    target: 'http://0.0.0.0:4001',
    changeOrigin: true,
  })
);

const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Wrapper server listening on port ${port}`);
});
