import { mockedApi, withCallerId } from './fixtures/mockedApi';
import { randomAlphanumeric, randomExistingUser } from './fixtures/generators';

describe('/users/{userId}/validate', () => {
  describe('POST /users/{userId}/resend_verification', () => {
    it('resends a verification email for an existing user', async () => {
      const testUser = randomExistingUser({ password: randomAlphanumeric(10) });
      const { api } = mockedApi([testUser]);
      const response = await withCallerId(testUser.userId)(
        api.post(`/users/${testUser.userId}/resend_verification`)
      );

      expect(response.statusCode).toBe(204);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const id = 1234567;
      const response = await withCallerId(id)(
        api.post(`/users/${id}/resend_verification`)
      );

      expect(response.statusCode).toBe(404);
    });
  });
});
