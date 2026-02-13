export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const json = (await response.json().catch(() => null)) as T & { error?: string };

  if (!response.ok) {
    throw new Error((json && 'error' in json && json.error) || 'Request failed');
  }

  return json;
}
