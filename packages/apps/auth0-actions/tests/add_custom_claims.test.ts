import { onExecutePostLogin } from '../src/add_custom_claims';
import { API, Event, EventTransaction } from '../src/types/post-login';
import { Auth0User } from '@weco/auth0-client';

describe('add_custom_claims', () => {
  const barcode = '1234567';
  const role = 'Reader';
  const user: Auth0User = {
    app_metadata: { barcode, role },
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

  it('adds the patron role to the ID token if the role scope is present', () => {
    onExecutePostLogin(
      createEvent(user, ['weco:patron_role']),
      mockPostLoginApi
    );
    expect(mockPostLoginApi.idToken.setCustomClaim).toHaveBeenLastCalledWith(
      'https://wellcomecollection.org/patron_role',
      role
    );
  });

  it('does not add anything if no patron role is present', () => {
    jest.clearAllMocks();
    onExecutePostLogin(
      createEvent({ app_metadata: {} } as Auth0User, ['weco:patron_role']),
      mockPostLoginApi
    );
    expect(mockPostLoginApi.accessToken.setCustomClaim).not.toBeCalled();
    expect(mockPostLoginApi.idToken.setCustomClaim).not.toBeCalled();
  });

  it('adds the patron role and barcode to the ID token if boths scopes are present', () => {
    onExecutePostLogin(
      createEvent(user, ['weco:patron_role', 'weco:patron_barcode']),
      mockPostLoginApi
    );
    expect(mockPostLoginApi.idToken.setCustomClaim).toHaveBeenCalledWith(
      'https://wellcomecollection.org/patron_role',
      role
    );
    expect(mockPostLoginApi.idToken.setCustomClaim).toHaveBeenCalledWith(
      'https://wellcomecollection.org/patron_barcode',
      barcode
    );
  });

  it('does not add anything if the scope is not present', () => {
    jest.clearAllMocks();
    onExecutePostLogin(createEvent(user, []), mockPostLoginApi);
    expect(mockPostLoginApi.accessToken.setCustomClaim).not.toBeCalled();
    expect(mockPostLoginApi.idToken.setCustomClaim).not.toBeCalled();
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
    validateToken: jest.fn(() => mockPostLoginApi),
    sendUserTo: jest.fn(() => mockPostLoginApi),
  },
};
