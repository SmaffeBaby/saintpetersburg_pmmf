export function createTelegramApi(getToken, fetchImpl = fetch) {
  return async (method, payload) => {
    const token = getToken();
    if (!token) throw Object.assign(new Error('Telegram token is not configured'), { code: 401 });
    let body;
    let headers;
    if (Object.values(payload).some(value => value instanceof Blob)) {
      body = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (value === undefined) continue;
        if (value instanceof Blob) body.append(key, value, value.name ?? 'Programme.pdf');
        else body.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    } else {
      headers = { 'content-type': 'application/json' };
      body = JSON.stringify(payload);
    }
    let data;
    try {
      const response = await fetchImpl(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST', headers, body, signal: AbortSignal.timeout(45000),
      });
      data = await response.json();
    } catch { throw Object.assign(new Error('Telegram network error'), { code: 0 }); }
    if (!data.ok) throw Object.assign(new Error('Telegram API error'), { code: data.error_code, retryAfter: data.parameters?.retry_after });
    return data.result;
  };
}
