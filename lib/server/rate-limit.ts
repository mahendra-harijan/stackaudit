type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 6;

function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

export function rateLimitByIp(headers: Headers, routeKey: string): RateLimitResult {
  const ip = getClientIp(headers);
  const ua = headers.get('user-agent') ?? 'unknown';
  const key = `${routeKey}:${ip}:${ua.slice(0, 60)}`;

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      ok: true,
      remaining: MAX_REQUESTS - 1,
      retryAfterSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  return {
    ok: true,
    remaining: MAX_REQUESTS - existing.count,
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}
