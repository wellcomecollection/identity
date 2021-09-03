import { ExistingUser, mockedApi } from './fixtures/mockedApi';

const testUser: ExistingUser = {
  userId: 12345678,
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
};

describe('/users/{userId}/send-verification', () => {
  describe('PUT /users/{userId}/send-verification', () => {
    it('sends a verification email', async () => {
      const { api, clients } = mockedApi([testUser]);
      const response = await api.put(
        `/users/${testUser.userId}/send-verification`
      );

      expect(response.statusCode).toBe(200);
      expect(clients.auth0.sendVerificationEmail).toHaveBeenCalledWith(
        testUser.userId
      );
    });

    it('304s for users that are already verified', async () => {
      const { api } = mockedApi([{ ...testUser, emailValidated: true }]);
      const response = await api.put(
        `/users/${testUser.userId}/send-verification`
      );

      expect(response.statusCode).toBe(304);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api.put(`/users/6666666/send-verification`);
      expect(response.statusCode).toBe(404);
    });
  });
});
