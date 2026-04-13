import { Router } from 'express';
import { getDb, lastInsertRowid } from '../database/init.js';

const router = Router();

function parseArticleId(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

function normalizeOptionalString(value) {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  const s = value.trim();
  return s.length ? s : null;
}

function normalizePublishedDate(value) {
  if (value == null) return { ok: true, date: null };
  const s = String(value).trim();
  if (!s) return { ok: true, date: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return { ok: false, error: 'Дата должна быть в формате ГГГГ-ММ-ДД' };
  }
  return { ok: true, date: s };
}

function readBody(req) {
  const { title, content, source, author, published_date } = req.body || {};
  const t = typeof title === 'string' ? title.trim() : '';
  const c = typeof content === 'string' ? content.trim() : '';
  if (!t || !c) {
    return { error: 'Заголовок и текст обязательны' };
  }
  const pub = normalizePublishedDate(published_date);
  if (!pub.ok) return { error: pub.error };
  return {
    title: t,
    content: c,
    source: normalizeOptionalString(source),
    author: normalizeOptionalString(author),
    published_date: pub.date,
  };
}

router.get('/', (req, res) => {
  try {
    const rows = getDb()
      .prepare(
        `SELECT id, title, content, source, author, published_date, created_at
         FROM articles
         ORDER BY datetime(created_at) DESC, id DESC`,
      )
      .all();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Не удалось загрузить статьи' });
  }
});

router.get('/:id', (req, res) => {
  const id = parseArticleId(req.params.id);
  if (id == null) {
    return res.status(400).json({ error: 'Некорректный идентификатор' });
  }
  try {
    const row = getDb()
      .prepare(
        `SELECT id, title, content, source, author, published_date, tags, summary, sentiment, created_at
         FROM articles WHERE id = ?`,
      )
      .get(id);
    if (!row) return res.status(404).json({ error: 'Статья не найдена' });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Не удалось загрузить статью' });
  }
});

router.post('/', (req, res) => {
  const payload = readBody(req);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }
  try {
    const stmt = getDb().prepare(
      `INSERT INTO articles (title, content, source, author, published_date)
       VALUES (?, ?, ?, ?, ?)`,
    );
    const info = stmt.run(
      payload.title,
      payload.content,
      payload.source,
      payload.author,
      payload.published_date,
    );
    const row = getDb()
      .prepare(
        `SELECT id, title, content, source, author, published_date, created_at
         FROM articles WHERE id = ?`,
      )
      .get(lastInsertRowid(info));
    res.status(201).json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Не удалось сохранить статью' });
  }
});

router.put('/:id', (req, res) => {
  const id = parseArticleId(req.params.id);
  if (id == null) {
    return res.status(400).json({ error: 'Некорректный идентификатор' });
  }
  const payload = readBody(req);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }
  try {
    const stmt = getDb().prepare(
      `UPDATE articles
       SET title = ?, content = ?, source = ?, author = ?, published_date = ?
       WHERE id = ?`,
    );
    const info = stmt.run(
      payload.title,
      payload.content,
      payload.source,
      payload.author,
      payload.published_date,
      id,
    );
    if (Number(info.changes) === 0) {
      return res.status(404).json({ error: 'Статья не найдена' });
    }
    const row = getDb()
      .prepare(
        `SELECT id, title, content, source, author, published_date, created_at
         FROM articles WHERE id = ?`,
      )
      .get(id);
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Не удалось обновить статью' });
  }
});

router.delete('/:id', (req, res) => {
  const id = parseArticleId(req.params.id);
  if (id == null) {
    return res.status(400).json({ error: 'Некорректный идентификатор' });
  }
  try {
    const info = getDb().prepare('DELETE FROM articles WHERE id = ?').run(id);
    if (Number(info.changes) === 0) {
      return res.status(404).json({ error: 'Статья не найдена' });
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Не удалось удалить статью' });
  }
});

export default router;
