const jsonHeaders = { 'Content-Type': 'application/json' };

async function handleJson(res) {
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Некорректный ответ сервера');
    }
  }
  if (!res.ok) {
    const msg = data && data.error ? data.error : `Ошибка ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function listArticles() {
  const res = await fetch('/api/articles');
  return handleJson(res);
}

export async function createArticle(payload) {
  const res = await fetch('/api/articles', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}
