export interface RetryOptions {
  timeoutMs?: number; // abort if the server sends no response headers within this time
  retryDelaysMs?: number[]; // one entry per retry; empty = no retries
  fastFailMs?: number; // only retry when the failed attempt came back within this time
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

const MAX_RETRY_AFTER_MS = 15000;

// fetch with a response timeout and retries for 503 (and 429 with Retry-After). A slow 503 is not retried: Google
// sometimes takes ~40s to say "unavailable", and retrying that would triple the wait.
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  {
    timeoutMs = 120000,
    retryDelaysMs = [2000, 5000],
    fastFailMs = 10000,
    fetchImpl = fetch,
    sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  }: RetryOptions = {}
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();
    let res: Response;
    try {
      res = await fetchImpl(url, { ...init, signal: controller.signal });
    } catch (err) {
      if (controller.signal.aborted) {
        throw new Error(`Hết thời gian chờ (${Math.round(timeoutMs / 1000)}s): máy chủ phản hồi quá chậm, hãy thử lại sau.`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    const retryAfterSec = Number(res.headers.get('retry-after'));
    // 429 usually means the quota is used up, so retrying only delays the error; honour it only
    // when the server says when to come back.
    const retryable = res.status === 503 || (res.status === 429 && retryAfterSec > 0);
    const canRetry =
      retryable && attempt < retryDelaysMs.length && Date.now() - startedAt < fastFailMs;
    if (!canRetry) return res;

    await sleep(
      retryAfterSec > 0 ? Math.min(retryAfterSec * 1000, MAX_RETRY_AFTER_MS) : retryDelaysMs[attempt]
    );
  }
}
