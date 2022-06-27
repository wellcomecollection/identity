import { mockedApi, withCallerId } from './fixtures/mockedApi';
import { ResponseStatus, SuccessResponse } from '@weco/identity-common';
import { PatronRecord } from '@weco/sierra-client';
import { randomExistingUser } from './fixtures/generators';

describe('/users/{userId}/registration', () => {
  describe('PUT /users/{userId}/registration', () => {
    it('changes the name in Sierra', async () => {
      const firstName = 'Jane';
      const lastName = 'Smith';
      const testUser = randomExistingUser({
        firstName: 'Auth0_Registration_undefined',
        lastName: 'Auth0_Registration_tempLastName',
      });
      const { api, clients } = mockedApi([testUser]);

      const response = await withCallerId('@machine')(
        api
          .put(`/users/${testUser.userId}/registration`)
          .send({ firstName, lastName })
      );

      expect(response.statusCode).toBe(204);

      const sierraUser = await clients.sierra.getPatronRecordByRecordNumber(
        testUser.userId
      );

      if (sierraUser.status === ResponseStatus.Success) {
        expect(sierraUser.result.firstName).toBe(firstName);
        expect(sierraUser.result.lastName).toBe(lastName);
      } else {
        throw new Error(`Unexpected failure from Sierra: ${sierraUser}`);
      }
    });

    it('returns a 204 if the name in Sierra is already correct', async () => {
      const firstName = 'Joe';
      const lastName = 'Bloggs';
      const testUser = randomExistingUser({ firstName, lastName });
      const { api, clients } = mockedApi([testUser]);

      const response = await withCallerId('@machine')(
        api
          .put(`/users/${testUser.userId}/registration`)
          .send({ firstName, lastName })
      );

      expect(response.statusCode).toBe(204);

      const sierraUser = await clients.sierra.getPatronRecordByRecordNumber(
        testUser.userId
      );

      expect(sierraUser.status).toBe(ResponseStatus.Success);
      const storedPatron = (sierraUser as SuccessResponse<PatronRecord>).result;

      expect(storedPatron.firstName).toBe(firstName);
      expect(storedPatron.lastName).toBe(lastName);
    });

    it('409s if a user is already registered', async () => {
      const firstName = 'Silas';
      const lastName = 'Burroughs';
      const testUser = randomExistingUser({
        firstName: 'Henry',
        lastName: 'Wellcome',
      });
      const { api, clients } = mockedApi([testUser]);

      const response = await withCallerId('@machine')(
        api
          .put(`/users/${testUser.userId}/registration`)
          .send({ firstName, lastName })
      );

      expect(response.statusCode).toBe(409);

      const sierraUser = await clients.sierra.getPatronRecordByRecordNumber(
        testUser.userId
      );

      expect(sierraUser.status).toBe(ResponseStatus.Success);
      const storedPatron = (sierraUser as SuccessResponse<PatronRecord>).result;

      expect(storedPatron.firstName).toBe('Henry');
      expect(storedPatron.lastName).toBe('Wellcome');
    });

    it('404s for users that do not exist', async () => {
      const { api } = mockedApi();
      const id = 6666666;
      const response = await withCallerId('@machine')(
        api
          .put(`/users/${id}/registration`)
          .send({ newPassword: 'firstName', password: 'lastName' })
          .set('Accept', 'application/json')
      );

      expect(response.statusCode).toBe(404);
    });
  });
});
