import { ExistingUser, mockedApi } from './fixtures/mockedApi';

const testUser: ExistingUser = {
  userId: 12345678,
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
};

describe('/users/{userId}/deletion-request', () => {
  describe('PUT /users/{userId}/deletion-request', () => {
    it('marks a user as having requested deletion, blocks the account, and sends deletion request emails', async () => {
      const { clients, api } = mockedApi([testUser]);
      const response = await api.put(
        `/users/${testUser.userId}/deletion-request`
      );
      expect(response.statusCode).toBe(200);

      const updatedAuth0User = await clients.auth0.get(testUser.userId);
      expect(updatedAuth0User?.metadata?.deleteRequested).not.toBeUndefined();
      expect(updatedAuth0User?.locked).toBe(true);

      expect(clients.email.sendDeleteRequestAdmin).toHaveBeenCalled();
      expect(clients.email.sendDeleteRequestUser).toHaveBeenCalled();
    });

    it('304s for a user already marked for deletion', async () => {
      const { api } = mockedApi([{ ...testUser, markedForDeletion: true }]);
      const response = await api.put(
        `/users/${testUser.userId}/deletion-request`
      );
      expect(response.statusCode).toBe(304);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api.put(`/users/6666666/deletion-request`);
      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /users/{userId}/deletion-request', () => {
    it('unmarks a user as having requested deletion', async () => {
      const { clients, api } = mockedApi([
        { ...testUser, markedForDeletion: true },
      ]);
      const response2 = await api.delete(
        `/users/${testUser.userId}/deletion-request`
      );
      expect(response2.statusCode).toBe(204);

      const updatedUser = clients.auth0.get(testUser.userId);
      expect(updatedUser?.metadata?.deleteRequested).toBeUndefined();
    });

    it('304s for an unmarked user', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api.delete(
        `/users/${testUser.userId}/deletion-request`
      );
      expect(response.statusCode).toBe(304);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api.delete(`/users/6666666/deletion-request`);
      expect(response.statusCode).toBe(404);
    });
  });
});
