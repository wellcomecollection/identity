import { mockedApi, withCallerId } from './fixtures/mockedApi';
import { ResponseStatus } from '@weco/identity-common';
import { randomExistingUser } from './fixtures/generators';

describe('/users/{userId}/password', () => {
  describe('PUT /users/{userId}/password', () => {
    it('changes a user password in Auth0', async () => {
      const newPassword = 'new-password';
      const oldPassword = 'old-password';
      const testUser = randomExistingUser({ password: oldPassword });
      const { api, clients } = mockedApi([testUser]);

      const response = await withCallerId(testUser.userId)(
        api
          .put(`/users/${testUser.userId}/password`)
          .send({ newPassword, password: oldPassword })
          .set('Accept', 'application/json')
      );

      expect(response.statusCode).toBe(200);

      const auth0Validate = await clients.auth0.validateUserCredentials(
        'test',
        testUser.email,
        newPassword
      );
      expect(auth0Validate.status).toBe(ResponseStatus.Success);
    });

    it('fails if the provided current password is not correct', async () => {
      const newPassword = 'new-password';
      const oldPassword = 'old-password';
      const testUser = randomExistingUser({ password: oldPassword });
      const { api } = mockedApi([testUser]);

      const response = await withCallerId(testUser.userId)(
        api
          .put(`/users/${testUser.userId}/password`)
          .send({ newPassword, password: 'wrong' })
          .set('Accept', 'application/json')
      );

      expect(response.statusCode).toBe(401);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const id = 6666666;
      const response = await withCallerId(id)(
        api
          .put(`/users/${id}/password`)
          .send({ newPassword: 'new-password', password: 'old-password' })
          .set('Accept', 'application/json')
      );

      expect(response.statusCode).toBe(404);
    });
  });
});
