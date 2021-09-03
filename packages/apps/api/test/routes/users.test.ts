import { ExistingUser, mockedApi } from './fixtures/mockedApi';
import { randomAlphanumeric, randomExistingUser } from './fixtures/generators';
import { User } from '../../src/models/user';

describe('/users', () => {
  describe('GET /users', () => {
    it('fetches a list of users', async () => {
      const existingUsers = Array.from({ length: 5 }).map((_) =>
        randomExistingUser()
      );
      const { api } = mockedApi(existingUsers);
      const response = await api.get(
        '/users?page=1&pageSize=10&sort=userId&sortDir=1'
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.results).toHaveLength(existingUsers.length);
      const returnedUserIds: number[] = response.body.results.map(
        (u: User) => u.userId
      );
      const realUserIds = existingUsers
        .map((user: ExistingUser) => user.userId)
        .sort();
      expect(returnedUserIds).toEqual(realUserIds);
    });

    it('can filter users by status', async () => {
      const activeUsers = Array.from({ length: 3 }).map((_) =>
        randomExistingUser()
      );
      const deletionUsers = Array.from({ length: 3 }).map((_) =>
        randomExistingUser({ markedForDeletion: true })
      );
      const { api } = mockedApi(activeUsers.concat(deletionUsers));
      const response = await api.get(
        '/users?page=1&pageSize=10&sort=userId&sortDir=1&status=deletePending'
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.results).toHaveLength(deletionUsers.length);
      const returnedUserIds: number[] = response.body.results.map(
        (u: User) => u.userId
      );
      const realUserIds = deletionUsers
        .map((user: ExistingUser) => user.userId)
        .sort();
      expect(returnedUserIds).toEqual(realUserIds);
    });
  });

  describe('POST /users', () => {
    it('creates a user', async () => {
      const { api, clients } = mockedApi();
      const { firstName, lastName, email } = randomExistingUser();
      const response = await api
        .post('/users')
        .send({
          password: randomAlphanumeric(10),
          firstName,
          lastName,
          email,
        })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(201);
      expect(response.body.email).toBe(email);
      expect(response.body.firstName).toBe(firstName);
      expect(response.body.lastName).toBe(lastName);

      const newUserId = response.body.userId;
      expect(clients.sierra.get(newUserId)?.email).toBe(email);
      expect(clients.auth0.get(newUserId)?.email).toBe(email);
    });

    it('does not create a user that already exists in Sierra', async () => {
      const testUser = randomExistingUser({ onlyInSierra: true });
      const { api } = mockedApi([testUser]);
      const response = await api
        .post('/users')
        .send({
          password: randomAlphanumeric(10),
          ...testUser,
        })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(409);
    });

    it('does not create a user that already exists in Auth0', async () => {
      const testUser = randomExistingUser({ onlyInAuth0: true });
      const { api } = mockedApi([testUser]);
      const response = await api
        .post('/users')
        .send({
          password: randomAlphanumeric(10),
          ...testUser,
        })
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(409);
    });
  });
});
