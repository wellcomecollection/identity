import {
  APIResponse,
  ResponseStatus,
  SuccessResponse,
} from '@weco/identity-common';
import { Auth0User, HttpAuth0Client } from '../src';
import mockAuth0Server, { apiRoot, routeUrls } from './mock-auth0-server';
import { compose, rest } from 'msw';
import { email, testUser, userId } from './test-user';

describe('HTTP Auth0 client', () => {
  const apiAudience: string = 'http://my-api.localhost';
  const clientId: string = 'abcdefghijklmnopqrstuvwxyz';
  const clientSecret: string = 'ABCDEFGHIJKLMNOPQRSTUVYWXYZ';

  const client = new HttpAuth0Client(
    apiRoot,
    apiAudience,
    clientId,
    clientSecret
  );

  beforeAll(() => mockAuth0Server.listen());
  afterAll(() => mockAuth0Server.close());
  afterEach(() => mockAuth0Server.resetHandlers());

  describe('get user by user id', () => {
    it('finds a user by ID', async () => {
      const response: APIResponse<Auth0User> = await client.getUserByUserId(
        userId
      );
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0User>>response).result;
      expect(result).toEqual(expect.objectContaining(testUser));
    });

    it('returns a NotFound if the user does not exist', async () => {
      mockAuth0Server.use(
        rest.get(routeUrls.user, (req, res, ctx) => res(ctx.status(404)))
      );

      const response = await client.getUserByUserId(userId);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an UnknownError if the Auth0 API returns a 500', async () => {
      mockAuth0Server.use(
        rest.get(routeUrls.user, (req, res, ctx) => res(ctx.status(500)))
      );

      const response = await client.getUserByUserId(userId);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('delete user', () => {
    it('deletes a user', async () => {
      const requestSpy = jest.fn();
      mockAuth0Server.events.on('request:start', requestSpy);
      const response = await client.deleteUser(userId);

      expect(response.status).toBe(ResponseStatus.Success);
      const lastCall = requestSpy.mock.calls[requestSpy.mock.calls.length - 1];
      expect(lastCall[0].url.toString()).toEqual(
        `http://auth0.test/api/v2/users/auth0%7Cp${userId}`
      );
      expect(lastCall[0].method).toBe('DELETE');
    });

    it('returns a RateLimited error if the API returns a 429', async () => {
      mockAuth0Server.use(
        rest.delete(routeUrls.user, (req, res, ctx) => res(ctx.status(429)))
      );
      const response = await client.deleteUser(userId);

      expect(response.status).toBe(ResponseStatus.RateLimited);
    });
  });

  describe('updates a user', () => {
    it('updates the email address of the user', async () => {
      const newEmail = 'new@email.com';

      const response = await client.updateUser({
        userId,
        email: newEmail,
      });
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0User>>response).result;
      expect(result).toEqual(
        expect.objectContaining({
          ...testUser,
          email: newEmail,
        })
      );
    });

    it('does not update the email address if the new value is already in use', async () => {
      mockAuth0Server.use(
        rest.patch(routeUrls.user, (req, res, ctx) =>
          res(
            compose(
              ctx.status(400),
              ctx.json({ message: 'The specified new email already exists' })
            )
          )
        )
      );
      const response = await client.updateUser({ userId, email });
      expect(response.status).toBe(ResponseStatus.UserAlreadyExists);
    });

    it('receives a malformed request', async () => {
      mockAuth0Server.use(
        rest.patch(routeUrls.user, (req, res, ctx) => res(ctx.status(400)))
      );

      const response = await client.updateUser({ userId, email });
      expect(response.status).toBe(ResponseStatus.MalformedRequest);
    });

    it('does not find the user', async () => {
      mockAuth0Server.use(
        rest.patch(routeUrls.user, (req, res, ctx) => res(ctx.status(404)))
      );

      const response = await client.updateUser({ userId, email });
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      mockAuth0Server.use(
        rest.patch(routeUrls.user, (req, res, ctx) => res(ctx.status(500)))
      );

      const response = await client.updateUser({ userId, email });
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('send verification email', () => {
    it('requests a new verification email', async () => {
      const response: APIResponse<void> = await client.sendVerificationEmail(
        userId
      );
      expect(response.status).toBe(ResponseStatus.Success);
    });

    it('returns an UnknownError if the Auth0 API returns a 500', async () => {
      mockAuth0Server.use(
        rest.post(routeUrls.verificationEmail, (req, res, ctx) =>
          res(ctx.status(500))
        )
      );

      const response = await client.sendVerificationEmail(userId);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });
});
