import { asAdmin, ExistingUser, mockedApi } from './fixtures/mockedApi';

const testUser: ExistingUser = {
  userId: 12345678,
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
};

describe('/users/{userId}', () => {
  describe('GET /users/{userId}', () => {
    it('fetches a user', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api.get(`/users/${testUser.userId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(testUser);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api.get(`/users/6666666`);
      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /users/{userId}', () => {
    it('updates a user', async () => {
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
      const { api } = mockedApi([testUser]);
      const response = await api
        .put(`/users/${testUser.userId}`)
        .send({ firstName: 'Experiment' })
        .set('Accept', 'application/json');
      expect(response.statusCode).toBe(403);
    });

    it('does update immutable fields for admins', async () => {
      const { api } = mockedApi([testUser]);
      const response = await asAdmin(api.put(`/users/${testUser.userId}`))
        .send({ firstName: 'Experiment' })
        .set('Accept', 'application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        ...testUser,
        firstName: 'Experiment',
      });
    });

    it('does not update emails if a user with that email already exists', async () => {
      const existingEmail = 'test2@test.com';
      const { api } = mockedApi([
        testUser,
        { ...testUser, userId: 87654321, email: existingEmail },
      ]);
      const response = await api
        .put(`/users/${testUser.userId}`)
        .send({ email: existingEmail })
        .set('Accept', 'application/json');
      expect(response.statusCode).toBe(409);
    });
  });

  describe('DELETE /users/{userId}', () => {
    it('deletes a user in Auth0 and Sierra', async () => {
      const { clients, api } = mockedApi([testUser]);
      const response = await api.delete(`/users/${testUser.userId}`);
      expect(response.statusCode).toBe(204);
      expect(clients.sierra.contains(testUser.userId)).toBe(false);
      expect(clients.auth0.contains(testUser.userId)).toBe(false);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api.delete(`/users/66666666`);
      expect(response.statusCode).toBe(404);
    });
  });
});
