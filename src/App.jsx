import { useCallback, useEffect, useState } from 'react';
import ArticleForm from './components/ArticleForm.jsx';
import { createArticle, listArticles } from './api/articles.js';

export default function App() {
  const [articles, setArticles] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const rows = await listArticles();
      setArticles(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setLoadError(e.message || 'Не удалось загрузить список');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleImported = useCallback(
    async (payload) => {
      await createArticle(payload);
      await refresh();
    },
    [refresh],
  );

  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem', maxWidth: 720 }}>
      <h1>Knowledge Graph News</h1>
      <p style={{ color: '#444' }}>
        Импорт статей в локальную SQLite; далее — анализ и граф (план в{' '}
        <code>PLAN.md</code>).
      </p>

      <ArticleForm onImported={handleImported} />

      <section>
        <h2 style={{ marginBottom: '0.5rem' }}>Импортированные статьи</h2>
        {loading ? <p>Загрузка…</p> : null}
        {loadError ? (
          <p role="alert" style={{ color: '#b00020' }}>
            {loadError}
          </p>
        ) : null}
        {!loading && !loadError && articles.length === 0 ? (
          <p style={{ color: '#666' }}>Пока нет статей — добавьте первую через форму выше.</p>
        ) : null}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {articles.map((a) => (
            <li
              key={a.id}
              style={{
                borderBottom: '1px solid #e0e0e0',
                padding: '0.75rem 0',
              }}
            >
              <strong>{a.title}</strong>
              <div style={{ fontSize: '0.9rem', color: '#555', marginTop: 4 }}>
                {[a.source, a.author, a.published_date].filter(Boolean).join(' · ') ||
                  'Без метаданных'}
              </div>
              {a.content ? (
                <p
                  style={{
                    margin: '0.5rem 0 0',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 120,
                    overflow: 'hidden',
                  }}
                >
                  {a.content}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
