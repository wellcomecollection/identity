import { ExistingUser, mockedApi } from './fixtures/mockedApi';

const testUser: ExistingUser = {
  userId: 12345678,
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
};

describe('/users/{userId}/lock', () => {
  describe('PUT /users/{userId}/lock', () => {
    it('locks a user in Auth0', async () => {
      const { clients, api } = mockedApi([testUser]);
      const response = await api.put(`/users/${testUser.userId}/lock`);
      expect(response.statusCode).toBe(200);

      const updatedUser = clients.auth0.get(testUser.userId);
      expect(updatedUser?.locked).toBe(true);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api.put(`/users/66666666/lock`);
      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /users/{userId}/lock', () => {
    it('unlocks a user in Auth0', async () => {
      const { clients, api } = mockedApi([testUser]);
      await api.put(`/users/${testUser.userId}/lock`);
      const response = await api.delete(`/users/${testUser.userId}/lock`);
      expect(response.statusCode).toBe(204);

      const updatedUser = clients.auth0.get(testUser.userId);
      expect(updatedUser?.locked).toBe(false);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api.delete(`/users/66666666/lock`);
      expect(response.statusCode).toBe(404);
    });
  });
});
