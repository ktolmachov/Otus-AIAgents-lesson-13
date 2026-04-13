import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDb, getDb } from './database/init.js';
import articlesRouter from './routes/articles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

initDb();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/api/articles', articlesRouter);

/** Confirms server and DB bootstrap (Фаза 1); REST API comes in Фаза 2. */
app.get('/api/health', (req, res) => {
  try {
    getDb().prepare('SELECT 1').get();
    res.json({ ok: true, db: true });
  } catch (e) {
    res.status(500).json({ ok: false, db: false, error: e.message });
  }
});

if (isProd) {
  const distPath = path.join(rootDir, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} (API + ${isProd ? 'static dist' : 'dev: use Vite on :5173'})`);
  if (isProd && !fs.existsSync(path.join(rootDir, 'dist'))) {
    console.warn('Production: run `npm run build` before `npm start`.');
  }
});
