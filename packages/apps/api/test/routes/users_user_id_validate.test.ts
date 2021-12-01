import { mockedApi, withCallerId } from './fixtures/mockedApi';
import { randomAlphanumeric, randomExistingUser } from './fixtures/generators';

describe('/users/{userId}/validate', () => {
  describe('POST /users/{userId}/validate', () => {
    it('validates a correct user password', async () => {
      const testUser = randomExistingUser({ password: randomAlphanumeric(10) });
      const { api } = mockedApi([testUser]);
      const response = await withCallerId(testUser.userId)(
        api.post(`/users/${testUser.userId}/validate`)
      )
        .send({ password: testUser.password })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
    });

    it('401s for an incorrect user password', async () => {
      const testUser = randomExistingUser();
      const { api } = mockedApi([testUser]);
      const response = await withCallerId(testUser.userId)(
        api.post(`/users/${testUser.userId}/validate`)
      )
        .send({ password: 'incorrect-password' })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(401);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const id = 1234567;
      const response = await withCallerId(id)(
        api
          .post(`/users/${id}/validate`)
          .send({ password: 'beep-boop' })
          .set('Accept', 'application/json')
      );

      expect(response.statusCode).toBe(404);
    });
  });
});
