import { ExistingUser, mockedApi, withSourceIp } from './fixtures/mockedApi';

const testUser: ExistingUser = {
  userId: 12345678,
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'super-secret',
};

describe('/users/{userId}/validate', () => {
  describe('POST /users/{userId}/validate', () => {
    it('validates a correct user password', async () => {
      const { api } = mockedApi([testUser]);
      const response = await withSourceIp(
        api.post(`/users/${testUser.userId}/validate`)
      )
        .send({ password: testUser.password })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
    });

    it('401s for an incorrect user password', async () => {
      const { api } = mockedApi([testUser]);
      const response = await withSourceIp(
        api.post(`/users/${testUser.userId}/validate`)
      )
        .send({ password: 'incorrect-password' })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(401);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi([testUser]);
      const response = await api
        .post(`/users/66666666/validate`)
        .send({ password: 'beep-boop' })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(404);
    });
  });
});
