import {
  install as installFakeTimers,
  InstalledClock,
} from '@sinonjs/fake-timers';
import { RateLimiter } from 'limiter';
import { performance } from 'perf_hooks';
import { rateLimit } from '../src/rate-limits';

const range = (n: number) => Array.from({ length: n }).map((_, i) => i);

class RateLimitedError extends Error {}

// Creates a list of `n` functions which will throw a RateLimitedError if they are called above a given rate
const rateLimitedFunctionCalls = (
  n: number,
  { interval, limit }: { interval: 'minute' | 'second'; limit: number },
  implementation: () => Promise<void> = async () => {}
): jest.Mock<Promise<number>>[] => {
  const apiRateLimiter = new RateLimiter({
    tokensPerInterval: limit,
    interval,
  });
  return range(n).map((i) =>
    jest.fn(async () => {
      const success = apiRateLimiter.tryRemoveTokens(1);
      if (success) {
        await implementation();
        return i;
      } else {
        throw new RateLimitedError();
      }
    })
  );
};

// Fake timers do not override perf_hooks (used by dependencies) so we have to do that ourselves
jest.mock('perf_hooks', () => ({
  performance: { now: () => 0 },
}));

describe('rate limiting', () => {
  // See https://github.com/facebook/jest/issues/11876 for why we're not using jest's fake timers
  let clock: InstalledClock;
  beforeAll(() => {
    clock = installFakeTimers({ now: Date.now() });
    performance.now = () => clock.now;
  });
  afterAll(() => {
    clock.uninstall();
  });

  it('limits the per-minute rate at which functions are called', async () => {
    const minutesRateLimit = 10;
    const functions = rateLimitedFunctionCalls(20, {
      interval: 'minute',
      limit: minutesRateLimit,
    });
    const rateLimiter = rateLimit({
      rateLimits: { minute: minutesRateLimit, second: minutesRateLimit },
      maxConcurrency: 10,
    });

    const rateLimitPromise = rateLimiter(functions);
    await clock.tickAsync('02:01');
    const results = await rateLimitPromise;
    expect(results).toEqual(range(20));
  });

  it('limits the per-second rate at which functions are called', async () => {
    const secondsRateLimit = 10;
    const functions = rateLimitedFunctionCalls(20, {
      interval: 'second',
      limit: secondsRateLimit,
    });
    const rateLimiter = rateLimit({
      rateLimits: { minute: 61 * secondsRateLimit, second: secondsRateLimit },
      maxConcurrency: 10,
    });

    const rateLimitPromise = rateLimiter(functions);
    await clock.tickAsync('00:03');
    const results = await rateLimitPromise;

    expect(results).toEqual(range(20));
  });

  it('limits the concurrency of function calls', async () => {
    const executionTime = 1;
    const maxConcurrency = 10;
    const secondsRateLimit = maxConcurrency + 1;

    const semaphore = (() => {
      let count = 0;
      return {
        count,
        acquire: () => {
          count++;
          if (count > maxConcurrency) {
            throw new Error('Max concurrency exceeded!');
          }
        },
        release: () => {
          count--;
        },
      };
    })();
    const functions = rateLimitedFunctionCalls(
      20,
      {
        interval: 'second',
        limit: secondsRateLimit,
      },
      async () => {
        semaphore.acquire();
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * executionTime)
        );
        semaphore.release();
      }
    );

    const rateLimiter = rateLimit({
      rateLimits: { minute: 60 * secondsRateLimit, second: secondsRateLimit },
      maxConcurrency,
    });
    const rateLimitPromise = rateLimiter(functions);
    await clock.tickAsync('00:03');
    const results = await rateLimitPromise;

    expect(results).toEqual(range(20));
  });
});
