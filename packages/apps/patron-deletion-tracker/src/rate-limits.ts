import { RateLimiter } from 'limiter';
import PQueue from 'p-queue';

type RateLimits = {
  second: number;
  minute: number;
};

export const rateLimit =
  ({
    rateLimits,
    maxConcurrency,
  }: {
    rateLimits: RateLimits;
    maxConcurrency: number;
  }) =>
  async <T>(calls: Array<() => Promise<T>>): Promise<T[]> => {
    const secondsLimiter = new RateLimiter({
      tokensPerInterval: rateLimits.second,
      interval: 'second',
    });

    const queue = new PQueue({
      concurrency: maxConcurrency,
      interval: 1000 * 60, // 1 minute
      intervalCap: rateLimits.minute,
      timeout: 1000 * 30, // 30 seconds
      throwOnTimeout: true,
    });

    return queue.addAll(
      calls.map((call) => async () => {
        await secondsLimiter.removeTokens(1);
        return call();
      })
    );
  };
