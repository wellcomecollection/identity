import { onExecutePostLogin } from '../src/add_custom_claims';
import { API, Event, EventTransaction } from '../src/types/post-login';
import { Auth0User } from '@weco/auth0-client';

describe('add_custom_claims', () => {
  const barcode = '1234567';
  const user: Auth0User = {
    app_metadata: { barcode },
  } as Auth0User;
  const createEvent = (user: Auth0User, scopes: string[]): Event<Auth0User> =>
    ({
      user,
      transaction: { requested_scopes: scopes } as EventTransaction,
    } as Event<Auth0User>);

  it('adds the patron barcode to the ID token if the barcode scope is present', () => {
    onExecutePostLogin(
      createEvent(user, ['weco:patron_barcode']),
      mockPostLoginApi
    );
    expect(mockPostLoginApi.idToken.setCustomClaim).toHaveBeenLastCalledWith(
      'https://wellcomecollection.org/patron_barcode',
      barcode
    );
  });

  it('does not add anything if no patron barcode is present', () => {
    jest.clearAllMocks();
    onExecutePostLogin(
      createEvent({ app_metadata: {} } as Auth0User, ['weco:patron_barcode']),
      mockPostLoginApi
    );
    expect(mockPostLoginApi.accessToken.setCustomClaim).not.toBeCalled();
    expect(mockPostLoginApi.idToken.setCustomClaim).not.toBeCalled();
  });

  it('does not add anything if the scope is not present', () => {
    jest.clearAllMocks();
    onExecutePostLogin(createEvent(user, []), mockPostLoginApi);
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
