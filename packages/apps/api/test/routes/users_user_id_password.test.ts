import { mockedApi } from './fixtures/mockedApi';
import { ResponseStatus } from '@weco/identity-common';
import { randomExistingUser } from './fixtures/generators';

describe('/users/{userId}/password', () => {
  describe('PUT /users/{userId}/password', () => {
    it('changes a user password in both Auth0 and Sierra', async () => {
      const testUser = randomExistingUser();
      const { api, clients } = mockedApi([testUser]);
      const newPassword = 'new-password';
      const response = await api
        .put(`/users/${testUser.userId}/password`)
        .send({ password: newPassword })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);

      const auth0Validate = await clients.auth0.validateUserCredentials(
        'test',
        testUser.email,
        newPassword
      );
      expect(auth0Validate.status).toBe(ResponseStatus.Success);

      const sierraUser = await clients.sierra.get(testUser.userId);
      const sierraValidate = await clients.sierra.validateCredentials(
        sierraUser?.barcode || '',
        newPassword
      );
      expect(sierraValidate.status).toBe(ResponseStatus.Success);
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const response = await api
        .put(`/users/66666666/password`)
        .send({ password: 'new-password' })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(404);
    });
  });
});