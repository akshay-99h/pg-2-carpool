const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => null)) as T & { error?: string };
  if (!response.ok) {
    throw new Error((body && 'error' in body && body.error) || 'Request failed');
  }

  return body;
}
