export function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit & { timeout?: number }): Promise<Response> {
  const controller = new AbortController();
  const timeout = init?.timeout ?? init?.signal ? undefined : 15000;
  if (timeout !== undefined) {
    const id = setTimeout(() => controller.abort(), timeout);
    init = { ...init, signal: controller.signal };
    const original = init;
    return fetch(input, original).finally(() => clearTimeout(id)).then((res) => res) as Promise<Response>;
  }
  return fetch(input, init);
}

export async function fetchJSON<T = unknown>(input: string, init: RequestInit = {}): Promise<T> {
  const res = await fetchWithTimeout(input, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}
