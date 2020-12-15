import axios, {AxiosInstance} from 'axios';
import moxios from 'moxios';
import Auth0Client from '../src';
import {APIResponse, ResponseStatus, SuccessResponse} from '@weco/identity-common';
import {equal} from 'assert'
import {Auth0Profile, Auth0UserInfo} from '../src/auth0';

describe('auth0 client', () => {

  let client: Auth0Client;

  beforeEach(() => {
    // @ts-ignore
    moxios.install(axios as AxiosInstance);
    moxios.stubRequest(apiRoot + '/oauth/token', {
      status: 200,
      response: {
        access_token: accessToken
      }
    });

    client = new Auth0Client(apiRoot, apiAudience, clientId, clientSecret);
  });

  afterEach(() => {
    // @ts-ignore
    moxios.uninstall(axios as AxiosInstance);
  });

  describe('validate access token', () => {

    it('validates', async () => {
      moxios.stubRequest('/userinfo', {
        status: 200,
        response: userInfo
      });

      const response = await client.validateAccessToken(accessToken);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0UserInfo>>response).result;
      equal(result.userId, userId);
      equal(result.email, email);
    });

    it('does not validate', async () => {
      moxios.stubRequest('/userinfo', {
        status: 401
      });

      const response = await client.validateAccessToken(accessToken);
      equal(response.status, ResponseStatus.InvalidCredentials);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/userinfo', {
        status: 500
      });

      const response = await client.validateAccessToken(accessToken);
      equal(response.status, ResponseStatus.UnknownError);
    });
  });

  describe('get user by user id', () => {

    it('finds the user with blocked', async () => {
      moxios.stubRequest('/users/auth0|p' + userId, {
        status: 200,
        response: Object.assign(user, {
          blocked: false
        })
      });

      const response: APIResponse<Auth0Profile> = await client.getUserByUserId(userId);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      equal(result.userId, 'auth0|p' + userId);
      equal(result.email, email);
      equal(result.emailValidated, emailValidated);
      equal(result.locked, locked);
      equal(result.creationDate, creationDate);
      equal(result.lastLogin, lastLoginDate);
      equal(result.lastLoginIp, lastLoginIp);
      equal(result.totalLogins, totalLogins);
    });

    it('finds the user without blocked', async () => {
      moxios.stubRequest('/users/auth0|p' + userId, {
        status: 200,
        response: user
      });

      const response: APIResponse<Auth0Profile> = await client.getUserByUserId(123456);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      equal(result.userId, 'auth0|p' + userId);
      equal(result.email, email);
      equal(result.emailValidated, emailValidated);
      equal(result.locked, locked);
      equal(result.creationDate, creationDate);
      equal(result.lastLogin, lastLoginDate);
      equal(result.lastLoginIp, lastLoginIp);
      equal(result.totalLogins, totalLogins);
    });

    it('does not find the user', async () => {
      moxios.stubRequest('/users/auth0|p' + userId, {
        status: 404
      });

      const response = await client.getUserByUserId(userId);
      equal(response.status, ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/users/auth0|p' + userId, {
        status: 500
      });

      const response = await client.getUserByUserId(userId);
      equal(response.status, ResponseStatus.UnknownError);
    });
  });

  describe('get user by email', () => {

    it('finds the user with blocked', async () => {
      moxios.stubRequest('/users-by-email?email=' + email, {
        status: 200,
        response: [
          Object.assign(user, {
            blocked: false
          })
        ]
      });

      const response = await client.getUserByEmail(email);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      equal(result.userId, 'auth0|p' + userId);
      equal(result.email, email);
      equal(result.emailValidated, emailValidated);
      equal(result.locked, locked);
      equal(result.creationDate, creationDate);
      equal(result.lastLogin, lastLoginDate);
      equal(result.lastLoginIp, lastLoginIp);
      equal(result.totalLogins, totalLogins);
    });

    it('does not find the user', async () => {
      moxios.stubRequest('/users-by-email?email=' + email, {
        status: 200,
        response: []
      });

      const response = await client.getUserByEmail(email);
      equal(response.status, ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/users-by-email?email=' + email, {
        status: 500
      });

      const response = await client.getUserByEmail(email);
      equal(response.status, ResponseStatus.UnknownError);
    });
  });

  it('finds the user without blocked', async () => {
    moxios.stubRequest('/users-by-email?email=' + email, {
      status: 200,
      response: [
        user
      ]
    });

    const response = await client.getUserByEmail(email);
    equal(response.status, ResponseStatus.Success);

    const result = (<SuccessResponse<Auth0Profile>>response).result;
    equal(result.userId, 'auth0|p' + userId);
    equal(result.email, email);
    equal(result.emailValidated, emailValidated);
    equal(result.locked, locked);
    equal(result.creationDate, creationDate);
    equal(result.lastLogin, lastLoginDate);
    equal(result.lastLoginIp, lastLoginIp);
    equal(result.totalLogins, totalLogins);
  });

  it('does not find the user', async () => {
    moxios.stubRequest('/users-by-email?email=' + email, {
      status: 200,
      response: []
    });

    const response = await client.getUserByEmail(email);
    equal(response.status, ResponseStatus.NotFound);
  });

  it('returns an unexpected response code', async () => {
    moxios.stubRequest('/users-by-email?email=' + email, {
      status: 500
    });

    const response = await client.getUserByEmail(email);
    equal(response.status, ResponseStatus.UnknownError);
  });

  describe('creates a user', () => {

    it('creates the user', async () => {
      moxios.stubRequest('/users', {
        status: 201,
        response: user
      });

      const response = await client.createUser(userId, email, password);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<Auth0Profile>>response).result;
      equal(result.userId, 'auth0|p' + userId);
      equal(result.email, email);
      equal(result.emailValidated, emailValidated);
      equal(result.locked, locked);
      equal(result.creationDate, creationDate);
      equal(result.lastLogin, lastLoginDate);
      equal(result.lastLoginIp, lastLoginIp);
      equal(result.totalLogins, totalLogins);
    });

    it('does not create the user', async () => {
      moxios.stubRequest('/users', {
        status: 409
      });

      const response = await client.createUser(userId, email, password);
      equal(response.status, ResponseStatus.UserAlreadyExists);
    });

    it('receives a malformed request', async () => {
      moxios.stubRequest('/users', {
        status: 400
      });

      const response = await client.createUser(userId, email, password);
      equal(response.status, ResponseStatus.MalformedRequest);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/users', {
        status: 500
      });

      const response = await client.createUser(userId, email, password);
      equal(response.status, ResponseStatus.UnknownError);
    });
  });
});


const apiRoot: string = 'http://localhost';
const apiAudience: string = 'http://my-api.localhost';
const clientId: string = 'abcdefghijklmnopqrstuvwxyz';
const clientSecret: string = 'ABCDEFGHIJKLMNOPQRSTUVYWXYZ';

const accessToken: string = 'a1b23c4d5e6f7g8hj';
const userId: number = 123456;
const email: string = 'test.user@example.com';
const password: string = 'superstrongpassword';
const picture: string = "https://i1.wp.com/cdn.auth0.com/avatars/tu.png?ssl=1";
const creationDate: string = "2020-11-18T14:27:34.766Z";
const updatedDate: string = "2020-12-09T09:09:24.042Z";
const passwordResetDate: string = "2020-11-19T12:03:02.999Z";
const lastLoginDate: string = "2020-12-09T09:09:24.042Z";
const lastLoginIp: string = "127.0.0.1";
const totalLogins: number = 10;
const emailValidated: boolean = true;
const locked: boolean = false;

const userInfo: any = {
  sub: 'auth0|p' + userId,
  nickname: email.substring(0, email.lastIndexOf('@')),
  name: email,
  picture: picture,
  updated_at: updatedDate,
  email: email,
  email_verified: emailValidated
}

const user: any = {
  created_at: creationDate,
  email: email,
  identities: [
    {
      user_id: 'p' + userId,
      provider: 'auth0',
      connection: 'Sierra-Connection',
      isSocial: false
    }
  ],
  name: email,
  nickname: email.substring(0, email.lastIndexOf('@')),
  picture: picture,
  updated_at: updatedDate,
  user_id: 'auth0|p' + userId,
  last_password_reset: passwordResetDate,
  email_verified: emailValidated,
  last_ip: lastLoginIp,
  last_login: lastLoginDate,
  logins_count: totalLogins
}
