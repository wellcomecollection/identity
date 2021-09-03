import { asAdmin, mockedApi } from './fixtures/mockedApi';
import { randomExistingUser } from './fixtures/generators';

describe('/users/{userId}', () => {
  describe('GET /users/{userId}', () => {
    it('fetches a user', async () => {
      const testUser = randomExistingUser();
      const { api } = mockedApi([testUser]);
      const response = await api.get(`/users/${testUser.userId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(testUser);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const response = await api.get(`/users/6666666`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /users/{userId}', () => {
    it('updates a user', async () => {
      const testUser = randomExistingUser();
      const { api } = mockedApi([testUser]);
      const response = await api
        .put(`/users/${testUser.userId}`)
        .send({ email: 'test2@test.com' })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        ...testUser,
        email: 'test2@test.com',
      });
    });

    it('does not update immutable fields for non-admins', async () => {
      const testUser = randomExistingUser();
      const { api } = mockedApi([testUser]);
      const response = await api
        .put(`/users/${testUser.userId}`)
        .send({ firstName: 'Test' })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(403);
    });

    it('does update immutable fields for admins', async () => {
      const testUser = randomExistingUser();
      const { api } = mockedApi([testUser]);
      const response = await asAdmin(api.put(`/users/${testUser.userId}`))
        .send({ firstName: 'Test' })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        ...testUser,
        firstName: 'Test',
      });
    });

    it('does not update emails if a user with that email already exists', async () => {
      const testUser1 = randomExistingUser();
      const testUser2 = randomExistingUser();
      const { api } = mockedApi([testUser1, testUser2]);
      const response = await api
        .put(`/users/${testUser1.userId}`)
        .send({ email: testUser2.email })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(409);
    });
  });

  describe('DELETE /users/{userId}', () => {
    it('deletes a user in Auth0 and Sierra', async () => {
      const testUser = randomExistingUser();
      const { clients, api } = mockedApi([testUser]);
      const response = await api.delete(`/users/${testUser.userId}`);

      expect(response.statusCode).toBe(204);
      expect(clients.sierra.contains(testUser.userId)).toBe(false);
      expect(clients.auth0.contains(testUser.userId)).toBe(false);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const response = await api.delete(`/users/66666666`);
      expect(response.statusCode).toBe(404);
    });
  });
});
