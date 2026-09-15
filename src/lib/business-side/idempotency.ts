const results = new Map<string, { expiresAt: number; value: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();

export async function withIdempotency<T>(key: string, ttlMs: number, operation: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const existing = results.get(key);
  if (existing && existing.expiresAt > now) {
    return existing.value as T;
  }
  if (existing) results.delete(key);

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = Promise.resolve()
    .then(operation)
    .then((value) => {
      results.set(key, { expiresAt: Date.now() + ttlMs, value });
      return value;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export function clearIdempotencyForTests() {
  results.clear();
  inFlight.clear();
}
