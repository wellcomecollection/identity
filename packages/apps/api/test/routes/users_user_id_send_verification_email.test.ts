import { mockedApi, withCallerId } from './fixtures/mockedApi';
import { randomAlphanumeric, randomExistingUser } from './fixtures/generators';

describe('POST /users/{userId}/send-verification-email', () => {
  it('sends a verification email for an existing user', async () => {
    const testUser = randomExistingUser({ password: randomAlphanumeric(10) });
    const { api, clients } = mockedApi([testUser]);
    const response = await withCallerId(testUser.userId)(
      api.post(`/users/${testUser.userId}/send-verification-email`)
    );

    expect(response.statusCode).toBe(204);
    expect(clients.auth0.sendVerificationEmail).toHaveBeenLastCalledWith(
      testUser.userId
    );
  });

  it('404s for users that do not exist', async () => {
    const { api, clients } = mockedApi();
    const id = 1234567;
    const response = await withCallerId(id)(
      api.post(`/users/${id}/send-verification-email`)
    );

    expect(response.statusCode).toBe(404);
    expect(clients.auth0.sendVerificationEmail).toHaveBeenLastCalledWith(id);
  });
});
