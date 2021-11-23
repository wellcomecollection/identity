import { mockedApi, withSourceIp } from './fixtures/mockedApi';
import { randomExistingUser } from './fixtures/generators';

describe('/users/{userId}', () => {
  describe('GET /users/{userId}', () => {
    it('fetches a user', async () => {
      const testUser = randomExistingUser();
      const { api } = mockedApi([testUser]);
      const response = await api.get(`/users/${testUser.userId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.userId).toBe(testUser.userId);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.firstName).toBe(testUser.firstName);
      expect(response.body.lastName).toBe(testUser.lastName);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const response = await api.get(`/users/6666666`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /users/{userId}', () => {
    it('updates a user', async () => {
      const testUser = randomExistingUser({ password: 'test-password' });
      const { api } = mockedApi([testUser]);
      const response = await withSourceIp(
        api
          .put(`/users/${testUser.userId}`)
          .send({ email: 'test2@test.com', password: testUser.password })
          .set('Accept', 'application/json')
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe('test2@test.com');
      expect(response.body.userId).toBe(testUser.userId);
      expect(response.body.firstName).toBe(testUser.firstName);
      expect(response.body.lastName).toBe(testUser.lastName);
    });

    it('fails if the correct current password is not provided', async () => {
      const testUser = randomExistingUser({ password: 'test-password' });
      const { api } = mockedApi([testUser]);
      const response = await withSourceIp(
        api
          .put(`/users/${testUser.userId}`)
          .send({ email: 'test2@test.com', password: 'wrong' })
          .set('Accept', 'application/json')
      );

      expect(response.statusCode).toBe(401);
    });

    it('does not update emails if a user with that email already exists', async () => {
      const testUser1 = randomExistingUser({ password: 'test-password' });
      const testUser2 = randomExistingUser();
      const { api } = mockedApi([testUser1, testUser2]);
      const response = await withSourceIp(
        api
          .put(`/users/${testUser1.userId}`)
          .send({ email: testUser2.email, password: testUser1.password })
          .set('Accept', 'application/json')
      );

      expect(response.statusCode).toBe(409);
    });
  });
});
