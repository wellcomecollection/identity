import { authenticatedInstanceFactory } from '@weco/identity-common';

describe('authenticatedInstanceFactory', () => {
  it('fetches a token on its first use', async () => {
    const testToken = 'test-access-token';
    const getToken = jest.fn().mockResolvedValueOnce({
      accessToken: testToken,
      expiresAt: 3600 + Math.floor(Date.now() / 1000),
    });

    const testFactory = authenticatedInstanceFactory(getToken);
    const instance = await testFactory();

    expect(getToken).toHaveBeenCalledTimes(1);
    expect(instance.defaults.headers['Authorization']).toBe(
      `Bearer ${testToken}`
    );
  });

  it('does not fetch a token on subsequent uses before expiry', async () => {
    const testToken = 'test-access-token';
    const getToken = jest.fn().mockResolvedValueOnce({
      accessToken: testToken,
      expiresAt: 3600 + Math.floor(Date.now() / 1000),
    });

    const testFactory = authenticatedInstanceFactory(getToken);
    for (let i = 0; i < 5; i++) {
      await testFactory();
    }

    expect(getToken).toHaveBeenCalledTimes(1);
  });

  it('fetches a new token after expiry', async () => {
    const testToken1 = 'test-access-token';
    const testToken2 = 'different-test-token';
    const expiryTime = 3600;

    jest.useFakeTimers();
    jest.setSystemTime(0);
    const getToken = jest
      .fn()
      .mockResolvedValueOnce({
        accessToken: testToken1,
        expiresAt: expiryTime + Math.floor(Date.now() / 1000),
      })
      .mockResolvedValueOnce({
        accessToken: testToken2,
        expiresAt: expiryTime + Math.floor(Date.now() / 1000),
      });

    const testFactory = authenticatedInstanceFactory(getToken);
    const firstInstance = await testFactory();
    jest.setSystemTime(expiryTime * 1000);
    const secondInstance = await testFactory();

    expect(getToken).toHaveBeenCalledTimes(2);
    expect(firstInstance.defaults.headers['Authorization']).toBe(
      `Bearer ${testToken1}`
    );
    expect(secondInstance.defaults.headers['Authorization']).toBe(
      `Bearer ${testToken2}`
    );
    jest.useRealTimers();
  });
});
