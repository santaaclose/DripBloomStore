// api/[...all].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let bootstrapped = false;
async function ensureRoutes() {
  if (!bootstrapped) {
    await registerRoutes(app); // подключаем все /api/* маршруты ОДИН раз
    bootstrapped = true;
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  await ensureRoutes();
  // @ts-ignore — прокидываем запрос в express
  app(req, res);
};
