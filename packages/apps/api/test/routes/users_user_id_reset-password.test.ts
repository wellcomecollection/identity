import { mockedApi } from './fixtures/mockedApi';
import { randomExistingUser } from './fixtures/generators';

describe('/users/{userId}/reset-password', () => {
  describe('PUT /users/{userId}/reset-password', () => {
    it('sends a password reset email', async () => {
      const testUser = randomExistingUser();
      const { api, clients } = mockedApi([testUser]);
      const response = await api.put(
        `/users/${testUser.userId}/reset-password`
      );

      expect(response.statusCode).toBe(200);
      expect(clients.auth0.sendPasswordResetEmail).toHaveBeenCalledWith(
        testUser.email
      );
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const response = await api.put(`/users/6666666/reset-password`);
      expect(response.statusCode).toBe(404);
    });
  });
});
