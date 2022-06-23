import {
  onContinuePostLogin,
  onExecutePostLogin,
} from '../src/redirect_to_full_registration';
import {
  API,
  EncodedToken,
  Event,
  EventRequest,
  EventTenant,
  EventSecrets,
  SendUserObject,
  ValidateToken,
} from '../src/types/post-login';
import { Auth0User } from '@weco/auth0-client';

describe('redirect_to_full_registration', () => {
  const user: Auth0User = {
    app_metadata: {},
  } as Auth0User;

  const createEvent = (user: Auth0User): Event<Auth0User> =>
    ({ user } as Event<Auth0User>);

  it('will not redirect the user if terms_and_conditions_accepted is false', () => {
    onExecutePostLogin(createEvent(user), mockPostLoginApi);
    expect(mockPostLoginApi.redirect.sendUserTo).not.toBeCalled();
  });

  it('redirects if the user firstname, surname is not present', () => {
    jest.clearAllMocks();
    const auth0SecretsObject = {
      IDENTITY_APP_BASEURL: 'stage.wellcomecollection.org',
      AUTH0_PAYLOAD_SECRET: 'ABCDEFG1234',
    };
    const newUser: Auth0User = {
      user_id: 'p|12345',
      email: 'raviravioli@pastatimes.com',
      app_metadata: { role: '' },
    };

    const event = {
      user,
      tenant: { id: 'tenant_stage' } as EventTenant,
      request: { hostname: 'stage.wellcomecollection.org' } as EventRequest,
      secrets: auth0SecretsObject as EventSecrets,
    };

    const createNewUserEvent = (user: Auth0User): Event<Auth0User> =>
      ({
        user,
        tenant: { id: 'tenant_stage' } as EventTenant,
        request: { hostname: 'stage.wellcomecollection.org' } as EventRequest,
        secrets: auth0SecretsObject as EventSecrets,
      } as Event<Auth0User>);

    const REGISTRATION_FORM_URL = `${event.secrets.IDENTITY_APP_BASEURL}/registration`;

    const encodeTokenPayload: EncodedToken = {
      secret: 'ABCDEFG1234',
      payload: {
        email: 'raviravioli@pastatimes.com',
        iss: `https://${event.request.hostname}/`,
        sub: 'p|12345',
      },
    };

    const sendUserQuery: SendUserObject = {
      query: {
        session_token: mockPostLoginApi.redirect.encodeToken(
          encodeTokenPayload
        ),
        redirect_uri: `https://${event.request.hostname}/continue`,
      },
    };

    onExecutePostLogin(createNewUserEvent(newUser), mockPostLoginApi);
    expect(mockPostLoginApi.redirect.encodeToken).toHaveBeenLastCalledWith(
      encodeTokenPayload
    );
    expect(mockPostLoginApi.redirect.sendUserTo).toHaveBeenLastCalledWith(
      REGISTRATION_FORM_URL,
      sendUserQuery
    );
  });

  it('sets appMetadata terms_and_conditions_accepted to true once form is submitted to /continue', () => {
    jest.clearAllMocks();
    const auth0SecretsObject = {
      IDENTITY_APP_BASEURL: 'stage.wellcomecollection.org',
      AUTH0_PAYLOAD_SECRET: 'ABCDEFG1234',
    };

    const submittedFullRegistrationUser: Auth0User = {
      app_metadata: { terms_and_conditions_accepted: true },
    } as Auth0User;

    const event = {
      submittedFullRegistrationUser,
      tenant: { id: 'tenant_stage' } as EventTenant,
      request: { hostname: 'stage.wellcomecollection.org' } as EventRequest,
      secrets: auth0SecretsObject as EventSecrets,
    };

    const validateTokenPayload: ValidateToken = {
      secret: 'ABCDEFG1234',
      tokenParameterName: 'token',
    };

    const continueNewUserEvent = (
      submittedFullRegistrationUser: Auth0User
    ): Event<Auth0User> =>
      ({
        user: submittedFullRegistrationUser as Auth0User,
        tenant: { id: 'tenant_stage' } as EventTenant,
        request: { hostname: 'stage.wellcomecollection.org' } as EventRequest,
        secrets: auth0SecretsObject as EventSecrets,
      } as Event<Auth0User>);

    const successUrl = `${event.secrets.IDENTITY_APP_BASEURL}/success`;
    const payload = { terms_and_conditions_accepted: true };
    onContinuePostLogin(continueNewUserEvent(user), mockPostLoginApi);
    expect(mockPostLoginApi.redirect.validateToken).toReturnWith(payload);
    expect(
      mockPostLoginApi.redirect.sendUserTo
    ).toHaveBeenLastCalledWith(successUrl, { query: { success: 'true' } });
  });
});

const mockPostLoginApi: API<Auth0User> = {
  terms_and_conditions_accepted: true,
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
    validateToken: jest
      .fn()
      .mockReturnValue({ terms_and_conditions_accepted: true }),
    sendUserTo: jest.fn(() => mockPostLoginApi),
  },
};
