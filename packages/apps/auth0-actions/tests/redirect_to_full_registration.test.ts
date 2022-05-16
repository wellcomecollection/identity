import { onExecutePostLogin } from '../src/add_custom_claims';
import { API, Event, EventTransaction } from '../src/types/post-login';
import { Auth0User } from '@weco/auth0-client';
import { TokenValidator } from '../../api-authorizer/src/authentication';
import { JsonWebTokenError, Jwt } from 'jsonwebtoken';

const alwaysSucceed =
  ({
    userId = 'auth0|ptest',
    scopes = [],
  }: {
    userId?: string;
    scopes?: string[];
  } = {}): TokenValidator =>
  () =>
    Promise.resolve({
      payload: { sub: userId, scope: scopes.join(' ') },
    } as unknown as Jwt);

const alwaysFail: TokenValidator = () =>
  Promise.reject(new JsonWebTokenError('invalid token'));

describe('redirect_to_full_registration', () => {
  const user: Auth0User = {
    app_metadata: {},
  } as Auth0User;
  const createEvent = (user: Auth0User): Event<Auth0User> =>
    ({
      user,
    } as Event<Auth0User>);

  it('redirects the user if terms_and_conditions_accepted is false', () => {
    onExecutePostLogin(createEvent(user), mockPostLoginApi);
    expect(mockPostLoginApi.redirect.sendUserTo).not.toBeCalled();
  });
});

const mockPostLoginApi: API<Auth0User> = {
  access: {
    deny: jest.fn(() => mockPostLoginApi),
  },
  accessToken: {
    setCustomClaim: jest.fn(() => mockPostLoginApi),
  },
  idToken: {
    setCustomClaim: jest.fn(() => mockPostLoginApi),
  },
  multifactor: {
    enable: jest.fn(() => mockPostLoginApi),
  },
  user: {
    setUserMetadata: jest.fn(() => mockPostLoginApi),
    setAppMetadata: jest.fn(() => mockPostLoginApi),
  },
  redirect: {
    encodeToken: jest.fn(() => mockPostLoginApi),
    validateToken: jest.fn(() => mockPostLoginApi),
    sendUserTo: jest.fn(() => mockPostLoginApi),
  },
};
