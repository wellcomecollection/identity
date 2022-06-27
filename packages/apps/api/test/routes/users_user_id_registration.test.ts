import { mockedApi, withCallerId } from './fixtures/mockedApi';
import { ResponseStatus } from '@weco/identity-common';
import { randomExistingUser } from './fixtures/generators';

describe('/users/{userId}/registration', () => {
  describe('PUT /users/{userId}/registration', () => {
    it('changes the name in Sierra', async () => {
      const firstName = 'Jane';
      const lastName = 'Smith';
      const testUser = randomExistingUser({ firstName: 'Auth0_Registration_undefined', lastName: 'Auth0_Registration_tempLastName' });
      const { api, clients } = mockedApi([testUser]);

      console.log('@@AWLC 1');

      const response = await withCallerId('@machine')(
        api
          .put(`/users/${testUser.userId}/registration`)
          .send({ firstName, lastName })
          // .set('Accept', 'application/json')
      );

      console.log('@@AWLC 2');

      expect(response.statusCode).toBe(204);

      console.log('@@AWLC 3');

      const sierraUser = await clients.sierra.getPatronRecordByRecordNumber(
        testUser.userId
      );

      console.log('@@AWLC 4');

      if (sierraUser.status === ResponseStatus.Success) {
        expect(sierraUser.result.firstName).toBe(firstName);
        expect(sierraUser.result.lastName).toBe(lastName);
      } else {
        throw new Error(`Unexpected failure from Sierra: ${sierraUser}`);
      }

      console.log('@@AWLC 5');
    });

    // it('404s for users that do not exist', async () => {
    //   const { api } = mockedApi();
    //   const id = 6666666;
    //   const response = await withCallerId('@machine')(
    //     api
    //       .put(`/users/${id}/registration`)
    //       .send({ newPassword: 'firstName', password: 'lastName' })
    //       .set('Accept', 'application/json')
    //   );

    //   expect(response.statusCode).toBe(404);
    // });
  });
});
