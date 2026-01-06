const jsonHeaders = { 'Content-Type': 'application/json' };

export const apiGet = async <T>(path: string): Promise<T> => {
  const res = await fetch(path, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
  const res = await fetch(path, {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const apiPut = async <T>(path: string, body: unknown): Promise<T> => {
  const res = await fetch(path, {
    method: 'PUT',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const apiDelete = async <T>(path: string): Promise<T> => {
  const res = await fetch(path, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};
