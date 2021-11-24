import changePassword from '../src/change_password';
import { MockSierraClient } from '@weco/sierra-client';
import { errorResponse, ResponseStatus } from '@weco/identity-common';

const mockSierraClient = new MockSierraClient();
jest.mock('@weco/sierra-client', () => {
  const actualModule = jest.requireActual('@weco/sierra-client');
  return {
    ...actualModule,
    HttpSierraClient: function () {
      return mockSierraClient;
    },
  };
});

describe('change password script', () => {
  afterEach(() => {
    mockSierraClient.reset();
  });

  it('returns true if the password is successfully updated', (done) => {
    const oldPassword = 'old-password';
    const newPassword = 'new-password';
    const testPatron = MockSierraClient.randomPatronRecord();
    mockSierraClient.addPatron(testPatron, oldPassword);

    const callback = (
      error?: NodeJS.ErrnoException | null,
      success?: boolean
    ) => {
      expect(error).toBe(null);
      expect(success).toBe(true);
      expect(mockSierraClient.getPassword(testPatron.recordNumber)).toBe(
        newPassword
      );
      done();
    };

    changePassword(testPatron.email, newPassword, callback);
  });

  it('returns false if the user does not exist in Sierra', (done) => {
    const callback = (
      error?: NodeJS.ErrnoException | null,
      success?: boolean
    ) => {
      expect(error).toBe(null);
      expect(success).toBe(false);
      done();
    };

    changePassword('doesnotexist@email.com', 'password', callback);
  });

  it('throws an error if the Sierra request returns an error', (done) => {
    const testPatron = MockSierraClient.randomPatronRecord();
    mockSierraClient.addPatron(testPatron);
    mockSierraClient.updatePassword.mockResolvedValueOnce(
      errorResponse('bad computer', ResponseStatus.UnknownError)
    );
    const callback = (
      error?: NodeJS.ErrnoException | null,
      success?: boolean
    ) => {
      expect(error).toBeInstanceOf(Error);
      expect(success).toBe(undefined);
      done();
    };

    changePassword(testPatron.email, 'password', callback);
  });
});
