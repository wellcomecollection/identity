import axios, { AxiosInstance } from 'axios';
import moxios from 'moxios';
import { User } from 'auth0';
import createAzureAdProfile from '../src/create_azure_ad_profile';
import { IAuth0RuleContext } from '@tepez/auth0-rules-types';

describe('create_azure_ad_profile script', () => {
  beforeEach(() => {
    moxios.install(axios as AxiosInstance);
  });

  afterEach(() => {
    moxios.uninstall(axios as AxiosInstance);
  });

  it('constructs an Auth0 user object from a user profile fetched from Microsoft Graph', (done) => {
    moxios.stubRequest(/^https:\/\/graph\.microsoft\.com/, {
      status: 200,
      response: {
        id: 'test_id',
        mail: 'test@test.test',
        givenName: 'Test',
        surname: 'Testing',
      },
    });

    const callback = (error: NodeJS.ErrnoException | null, data?: User) => {
      expect(error).toBe(null);
      expect(data).toEqual({
        user_id: 'test_id',
        email: 'test@test.test',
        name: 'Test Testing',
        given_name: 'Test',
        family_name: 'Testing',
      });
      done();
    };
    createAzureAdProfile('', {} as IAuth0RuleContext, callback);
  });

  it('throws an error if Microsoft Graph returns an error', (done) => {
    moxios.stubRequest(/^https:\/\/graph\.microsoft\.com/, {
      status: 401,
    });

    const callback = (error: NodeJS.ErrnoException | null, data?: User) => {
      expect(error).toBeInstanceOf(Error);
      done();
    };
    createAzureAdProfile('', {} as IAuth0RuleContext, callback);
  });

  it('uses the passed access token for the request to Microsoft Graph', (done) => {
    const testToken = 'test_token';
    moxios.stubRequest(/^https:\/\/graph\.microsoft\.com/, {
      status: 200,
      response: {
        id: 'test_id',
        mail: 'test@test.test',
        givenName: 'Test',
        surname: 'Testing',
      },
    });

    const callback = (error: NodeJS.ErrnoException | null, data?: User) => {
      const authHeader = moxios.requests.mostRecent().headers.Authorization;
      expect(authHeader).toBe(`Bearer ${testToken}`);
      done();
    };
    createAzureAdProfile(testToken, {} as IAuth0RuleContext, callback);
  });
});
