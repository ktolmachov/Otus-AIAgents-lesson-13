import { useState } from 'react';

const fieldStyle = { display: 'block', width: '100%', marginTop: 4, padding: '0.5rem' };
const labelStyle = { display: 'block', marginTop: '0.75rem', fontWeight: 600 };

export default function ArticleForm({ onImported }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [author, setAuthor] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onImported({
        title,
        content,
        source: source || undefined,
        author: author || undefined,
        published_date: publishedDate || undefined,
      });
      setTitle('');
      setContent('');
      setSource('');
      setAuthor('');
      setPublishedDate('');
    } catch (err) {
      setError(err.message || 'Ошибка импорта');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: '1px solid #ccc',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        background: '#fafafa',
      }}
    >
      <h2 style={{ marginTop: 0 }}>Импорт статьи</h2>

      <label style={labelStyle}>
        Заголовок
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={fieldStyle}
          placeholder="Заголовок статьи"
        />
      </label>

      <label style={labelStyle}>
        Текст статьи
        <textarea
          required
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ ...fieldStyle, resize: 'vertical' }}
          placeholder="Вставьте текст статьи"
        />
      </label>

      <label style={labelStyle}>
        Источник
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={fieldStyle}
          placeholder="Например, издание или URL"
        />
      </label>

      <label style={labelStyle}>
        Автор
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={fieldStyle}
          placeholder="Автор"
        />
      </label>

      <label style={labelStyle}>
        Дата публикации
        <input
          type="date"
          value={publishedDate}
          onChange={(e) => setPublishedDate(e.target.value)}
          style={fieldStyle}
        />
      </label>

      {error ? (
        <p role="alert" style={{ color: '#b00020', marginTop: '0.75rem' }}>
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        style={{
          marginTop: '1rem',
          padding: '0.6rem 1.2rem',
          fontWeight: 600,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? 'Сохранение…' : 'Импортировать'}
      </button>
    </form>
  );
}
