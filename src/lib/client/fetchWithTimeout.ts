export class FetchTimeoutError extends Error {
  constructor(message: string = "Fetch timed out") {
    super(message);
    this.name = "FetchTimeoutError";
  }
}

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

export async function fetchWithTimeout(
  input: string | URL | Request,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...rest } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(input, {
      ...rest,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new FetchTimeoutError(`Request timed out after ${timeout}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchJSON<T = unknown>(
  input: string | URL | Request,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const res = await fetchWithTimeout(input, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
