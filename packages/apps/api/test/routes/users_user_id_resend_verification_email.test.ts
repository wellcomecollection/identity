import { mockedApi, withCallerId } from './fixtures/mockedApi';
import { randomAlphanumeric, randomExistingUser } from './fixtures/generators';

describe('/users/{userId}/validate', () => {
  describe('POST /users/{userId}/resend_verification', () => {
    it('resends a verification email for an existing user', async () => {
      const testUser = randomExistingUser({ password: randomAlphanumeric(10) });
      const { api, clients } = mockedApi([testUser]);
      const response = await withCallerId(testUser.userId)(
        api.post(`/users/${testUser.userId}/resend_verification`)
      );

      expect(response.statusCode).toBe(204);
      expect(clients.auth0.resendVerificationEmail).toHaveBeenLastCalledWith(
        testUser.userId
      );
    });

    it('404s for users that do not exist', async () => {
      const { api, clients } = mockedApi();
      const id = 1234567;
      const response = await withCallerId(id)(
        api.post(`/users/${id}/resend_verification`)
      );

      expect(response.statusCode).toBe(404);
      expect(clients.auth0.resendVerificationEmail).toHaveBeenLastCalledWith(
        id
      );
    });
  });
});
