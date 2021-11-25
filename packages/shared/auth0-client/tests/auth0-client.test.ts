import {
  APIResponse,
  ResponseStatus,
  SuccessResponse,
} from '@weco/identity-common';
import axios, { AxiosInstance } from 'axios';
import moxios from 'moxios';
import { SierraUserIdPrefix } from '../src/auth0';
import { HttpAuth0Client } from '../src';
import { Auth0Profile, Auth0UserInfo, SierraConnection } from '../src/auth0';

describe('HTTP Auth0 client', () => {
  let client: HttpAuth0Client;

  beforeEach(() => {
    // @ts-ignore
    moxios.install(axios as AxiosInstance);
    moxios.stubRequest(apiRoot + '/oauth/token', {
      status: 200,
      response: {
        access_token: accessToken,
      },
    });

    client = new HttpAuth0Client(apiRoot, apiAudience, clientId, clientSecret);
  });

  afterEach(() => {
    // @ts-ignore
    moxios.uninstall(axios as AxiosInstance);
  });

  describe('delete user', () => {
    it('deletes the user with given id', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 204,
      });

      const response = await client.deleteUser(userId);

      expect(response.status).toBe(ResponseStatus.Success);
    });

    it('not found on invalid user', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 404,
      });

      const response = await client.deleteUser(userId);

      expect(response.status).toBe(ResponseStatus.NotFound);
    });
  });

  describe('validate access token', () => {
    it('validates', async () => {
      moxios.stubRequest('/userinfo', {
        status: 200,
        response: userInfo,
      });

      const response = await client.validateAccessToken(accessToken);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0UserInfo>>response).result;
      expect(result).toEqual(
        expect.objectContaining({ userId: userId.toString(), email })
      );
    });

    it('does not validate', async () => {
      moxios.stubRequest('/userinfo', {
        status: 401,
      });

      const response = await client.validateAccessToken(accessToken);
      expect(response.status).toBe(ResponseStatus.InvalidCredentials);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/userinfo', {
        status: 500,
      });

      const response = await client.validateAccessToken(accessToken);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('get user by user id', () => {
    it('finds the user with blocked', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 200,
        response: {
          ...user,
          blocked: false,
        },
      });

      const response: APIResponse<Auth0Profile> = await client.getUserByUserId(
        userId
      );
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      expect(result).toEqual(
        expect.objectContaining({
          userId: userId.toString(),
          name,
          firstName,
          lastName,
          email,
          emailValidated,
          locked,
          creationDate,
          lastLoginDate,
          lastLoginIp,
          totalLogins,
        })
      );
    });

    it('finds the user without blocked', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 200,
        response: user,
      });

      const response: APIResponse<Auth0Profile> = await client.getUserByUserId(
        123456
      );
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      expect(result).toEqual(
        expect.objectContaining({
          userId: userId.toString(),
          name,
          firstName,
          lastName,
          email,
          emailValidated,
          locked,
          creationDate,
          lastLoginDate,
          lastLoginIp,
          totalLogins,
        })
      );
    });

    it('does not find the user', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 404,
      });

      const response = await client.getUserByUserId(userId);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 500,
      });

      const response = await client.getUserByUserId(userId);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('get user by email', () => {
    it('finds the user with blocked', async () => {
      moxios.stubRequest('/users-by-email?email=' + email, {
        status: 200,
        response: [
          {
            ...user,
            blocked: false,
          },
        ],
      });

      const response = await client.getUserByEmail(email);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      expect(result).toEqual(
        expect.objectContaining({
          userId: userId.toString(),
          name,
          firstName,
          lastName,
          email,
          emailValidated,
          locked,
          creationDate,
          lastLoginDate,
          lastLoginIp,
          totalLogins,
        })
      );
    });

    it('does not find the user', async () => {
      moxios.stubRequest('/users-by-email?email=' + email, {
        status: 200,
        response: [],
      });

      const response = await client.getUserByEmail(email);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/users-by-email?email=' + email, {
        status: 500,
      });

      const response = await client.getUserByEmail(email);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });

    it('finds the user without blocked', async () => {
      moxios.stubRequest('/users-by-email?email=' + email, {
        status: 200,
        response: [user],
      });

      const response = await client.getUserByEmail(email);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      expect(result).toEqual(
        expect.objectContaining({
          userId: userId.toString(),
          name,
          firstName,
          lastName,
          email,
          emailValidated,
          locked,
          creationDate,
          lastLoginDate,
          lastLoginIp,
          totalLogins,
        })
      );
    });

    it('does not find the user', async () => {
      moxios.stubRequest('/users-by-email?email=' + email, {
        status: 200,
        response: [],
      });

      const response = await client.getUserByEmail(email);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/users-by-email?email=' + email, {
        status: 500,
      });

      const response = await client.getUserByEmail(email);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('creates a user', () => {
    it('creates the user', async () => {
      moxios.stubRequest('/users', {
        status: 201,
        response: user,
      });

      const response = await client.createUser(
        userId,
        firstName,
        lastName,
        email,
        password
      );
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      expect(result).toEqual(
        expect.objectContaining({
          userId: userId.toString(),
          name,
          firstName,
          lastName,
          email,
          emailValidated,
          locked,
          creationDate,
          lastLoginDate,
          lastLoginIp,
          totalLogins,
        })
      );
    });

    it('does not create the user', async () => {
      moxios.stubRequest('/users', {
        status: 409,
      });

      const response = await client.createUser(
        userId,
        firstName,
        lastName,
        email,
        password
      );
      expect(response.status).toBe(ResponseStatus.UserAlreadyExists);
    });

    it('has an insecure password', async () => {
      moxios.stubRequest('/users', {
        status: 400,
        response: {
          message: 'PasswordStrengthError',
        },
      });

      const response = await client.createUser(
        userId,
        firstName,
        lastName,
        email,
        password
      );
      expect(response.status).toBe(ResponseStatus.PasswordTooWeak);
    });

    it('receives a malformed request', async () => {
      moxios.stubRequest('/users', {
        status: 400,
      });

      const response = await client.createUser(
        userId,
        firstName,
        lastName,
        email,
        password
      );
      expect(response.status).toBe(ResponseStatus.MalformedRequest);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/users', {
        status: 500,
      });

      const response = await client.createUser(
        userId,
        firstName,
        lastName,
        email,
        password
      );
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('updates a user', () => {
    it('updates the user', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 200,
        response: user,
      });

      const response = await client.updateUser(userId, email);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      expect(result).toEqual(
        expect.objectContaining({
          userId: userId.toString(),
          name,
          firstName,
          lastName,
          email,
          emailValidated,
          locked,
          creationDate,
          lastLoginDate,
          lastLoginIp,
          totalLogins,
        })
      );
    });

    it('does not update the user', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 400,
        response: {
          message: 'The specified new email already exists',
        },
      });

      const response = await client.updateUser(userId, email);
      expect(response.status).toBe(ResponseStatus.UserAlreadyExists);
    });

    it('receives a malformed request', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 400,
      });

      const response = await client.updateUser(userId, email);
      expect(response.status).toBe(ResponseStatus.MalformedRequest);
    });

    it('does not find the user', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 404,
      });

      const response = await client.updateUser(userId, email);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/users/' + SierraUserIdPrefix + userId, {
        status: 500,
      });

      const response = await client.updateUser(userId, email);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });
});

const apiRoot: string = 'http://localhost';
const apiAudience: string = 'http://my-api.localhost';
const clientId: string = 'abcdefghijklmnopqrstuvwxyz';
const clientSecret: string = 'ABCDEFGHIJKLMNOPQRSTUVYWXYZ';

const accessToken: string = 'a1b23c4d5e6f7g8hj';
const userId: number = 123456;
const firstName: string = 'Test';
const lastName: string = 'User';
const name: string = firstName + ' ' + lastName;
const email: string = 'test.user@example.com';
const password: string = 'superstrongpassword';
const picture: string = 'https://i1.wp.com/cdn.auth0.com/avatars/tu.png?ssl=1';
const creationDate: string = '2020-11-18T14:27:34.766Z';
const updatedDate: string = '2020-12-09T09:09:24.042Z';
const passwordResetDate: string = '2020-11-19T12:03:02.999Z';
const lastLoginDate: string = '2020-12-09T09:09:24.042Z';
const lastLoginIp: string = '127.0.0.1';
const totalLogins: number = 10;
const emailValidated: boolean = true;
const locked: boolean = false;

const userInfo: any = {
  sub: SierraUserIdPrefix + userId,
  nickname: email.substring(0, email.lastIndexOf('@')),
  name: name,
  given_name: firstName,
  family_name: lastName,
  picture: picture,
  updated_at: updatedDate,
  email: email,
  email_verified: emailValidated,
};

const user: any = {
  created_at: creationDate,
  email: email,
  identities: [
    {
      user_id: 'p' + userId,
      provider: 'auth0',
      connection: SierraConnection,
      isSocial: false,
    },
  ],
  name: name,
  given_name: firstName,
  family_name: lastName,
  nickname: email.substring(0, email.lastIndexOf('@')),
  picture: picture,
  updated_at: updatedDate,
  user_id: SierraUserIdPrefix + userId,
  last_password_reset: passwordResetDate,
  email_verified: emailValidated,
  last_ip: lastLoginIp,
  last_login: lastLoginDate,
  logins_count: totalLogins,
};
