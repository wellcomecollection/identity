import { mockedApi, withCallerId } from './fixtures/mockedApi';
import { randomExistingUser } from './fixtures/generators';

describe('/users/{userId}/deletion-request', () => {
  describe('PUT /users/{userId}/deletion-request', () => {
    it('marks a user as having requested deletion, blocks the account, and sends deletion request emails', async () => {
      const testUser = randomExistingUser({ password: 'test-password' });
      const { clients, api } = mockedApi([testUser]);
      const response = await withCallerId(testUser.userId)(
        api
          .put(`/users/${testUser.userId}/deletion-request`)
          .send({ password: testUser.password })
          .set('Accept', 'application/json')
      );
      expect(response.statusCode).toBe(200);

      const updatedAuth0User = await clients.auth0.get(testUser.userId);
      expect(updatedAuth0User?.metadata?.deleteRequested).not.toBeUndefined();
      expect(updatedAuth0User?.locked).toBe(true);

      expect(clients.email.sendDeleteRequestAdmin).toHaveBeenCalled();
      expect(clients.email.sendDeleteRequestUser).toHaveBeenCalled();
    });

    it('fails if the correct current password is not provided', async () => {
      const testUser = randomExistingUser({ password: 'test-password' });
      const { api } = mockedApi([testUser]);
      const response = await withCallerId(testUser.userId)(
        api
          .put(`/users/${testUser.userId}/deletion-request`)
          .send({ password: 'wrong' })
          .set('Accept', 'application/json')
      );
      expect(response.statusCode).toBe(401);
    });

    it('304s for a user already marked for deletion', async () => {
      const testUser = randomExistingUser({
        markedForDeletion: true,
        password: 'test-password',
      });
      const { api } = mockedApi([testUser]);
      const response = await withCallerId(testUser.userId)(
        api
          .put(`/users/${testUser.userId}/deletion-request`)
          .send({ password: testUser.password })
          .set('Accept', 'application/json')
      );
      expect(response.statusCode).toBe(304);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const id = 6666666;
      const response = await withCallerId(id)(
        api.put(`/users/${id}/deletion-request`)
      );
      expect(response.statusCode).toBe(404);
    });
  });
});
