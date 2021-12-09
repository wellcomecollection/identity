import { onExecutePostLogin } from '../src/add_custom_claims';
import { API, Event } from '../src/types/post-login';
import { Auth0User } from '@weco/auth0-client';

describe('add_custom_claims', () => {
  const barcode = '1234567';
  const user: Auth0User = {
    app_metadata: { barcode },
  } as Auth0User;
  const mockEvent: Event<Auth0User> = { user } as Event<Auth0User>;

  it('adds the patron barcode to the access token', () => {
    onExecutePostLogin(mockEvent, mockPostLoginApi);
    expect(
      mockPostLoginApi.accessToken.setCustomClaim
    ).toHaveBeenLastCalledWith(
      'https://wellcomecollection.org/patron_barcode',
      barcode
    );
  });

  it('adds the patron barcode to the ID token', () => {
    onExecutePostLogin(mockEvent, mockPostLoginApi);
    expect(mockPostLoginApi.idToken.setCustomClaim).toHaveBeenLastCalledWith(
      'https://wellcomecollection.org/patron_barcode',
      barcode
    );
  });

  it('does not add anything if no patron barcode is present', () => {
    jest.clearAllMocks();
    onExecutePostLogin(
      { user: { app_metadata: {} } as Auth0User } as Event<Auth0User>,
      mockPostLoginApi
    );
    expect(mockPostLoginApi.accessToken.setCustomClaim).not.toBeCalled();
    expect(mockPostLoginApi.idToken.setCustomClaim).not.toBeCalled();
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
} as API<Auth0User>;
