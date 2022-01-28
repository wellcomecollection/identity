import changeEmail from '../src/change_email';
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

describe('change email script', () => {
  afterEach(() => {
    mockSierraClient.reset();
  });

  it('returns true if the email is successfully updated', (done) => {
    const testPatron = MockSierraClient.randomPatronRecord();
    mockSierraClient.addPatron(testPatron);
    const newEmail = 'new@email.com';

    const callback = (
      error?: NodeJS.ErrnoException | null,
      success?: boolean
    ) => {
      expect(error).toBe(null);
      expect(success).toBe(true);
      expect(mockSierraClient.get(testPatron.recordNumber)?.email).toBe(
        newEmail
      );
      done();
    };

    changeEmail(testPatron.email, newEmail, false, callback);
  });

  it('adds a email verification note if the verified flag is true', (done) => {
    const testPatron = MockSierraClient.randomPatronRecord();
    mockSierraClient.addPatron(testPatron);
    const newEmail = 'new@email.com';

    const callback = (
      error?: NodeJS.ErrnoException | null,
      success?: boolean
    ) => {
      expect(error).toBe(null);
      expect(success).toBe(true);
      expect(mockSierraClient.get(testPatron.recordNumber)?.verifiedEmail).toBe(
        newEmail
      );
      done();
    };

    changeEmail(testPatron.email, newEmail, true, callback);
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

    changeEmail(
      'doesnotexist@email.com',
      'doesnotmatter@email.com',
      false,
      callback
    );
  });

  it('throws an error if the Sierra request returns an error', (done) => {
    const testPatron = MockSierraClient.randomPatronRecord();
    mockSierraClient.addPatron(testPatron);
    mockSierraClient.updatePatronEmail.mockResolvedValueOnce(
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

    changeEmail(testPatron.email, 'doesnotmatter@email.com', false, callback);
  });
});
