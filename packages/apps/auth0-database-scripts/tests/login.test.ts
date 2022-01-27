import { errorResponse, ResponseStatus } from '@weco/identity-common';
import { MockSierraClient, PatronRecord } from '@weco/sierra-client';
import { User } from 'auth0';
import login from '../src/login';
import { patronRecordToUser } from '../src/helpers';

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

const testPatronRecord: PatronRecord = {
  recordNumber: 1234567,
  barcode: '7654321',
  firstName: 'Test',
  lastName: 'Testing',
  email: 'test@test.test',
  role: 'Reader',
  verifiedEmails: [],
};

const testPatronPassword = 'super-secret';

describe('login script', () => {
  afterEach(() => {
    mockSierraClient.reset();
  });

  it('throws a credentials error if the user does not exist in Sierra', (done) => {
    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(data).toBe(undefined);
      expect(error).toBeInstanceOf(WrongUsernameOrPasswordError);
      done();
    };
    login('', '', callback);
  });

  it('throws an error if Sierra returns an error', (done) => {
    mockSierraClient.getPatronRecordByEmail.mockResolvedValueOnce(
      errorResponse('bad computer', ResponseStatus.UnknownError)
    );

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(data).toBe(undefined);
      expect(error).not.toBeInstanceOf(WrongUsernameOrPasswordError);
      expect(error).toBeInstanceOf(Error);
      done();
    };
    login(testPatronRecord.email, testPatronPassword, callback);
  });

  it('throws a credentials error if Sierra credentials validation fails', (done) => {
    mockSierraClient.addPatron(testPatronRecord, testPatronPassword);

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(data).toBe(undefined);
      expect(error).toBeInstanceOf(WrongUsernameOrPasswordError);
      done();
    };
    login(testPatronRecord.email, 'wrong-password', callback);
  });

  it('returns a user object populated by the patron record if validation succeeds', (done) => {
    mockSierraClient.addPatron(testPatronRecord, testPatronPassword);

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(error).toBe(null);
      expect(data).toMatchObject(patronRecordToUser(testPatronRecord));
      done();
    };
    login(testPatronRecord.email, testPatronPassword, callback);
  });

  describe('calls the Sierra client correctly', () => {
    it('by searching for the given email', (done) => {
      const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
        expect(
          mockSierraClient.getPatronRecordByEmail
        ).toHaveBeenLastCalledWith(testPatronRecord.email);
        done();
      };
      login(testPatronRecord.email, testPatronPassword, callback);
    });

    it('by validating the given password with the resolved patron barcode', (done) => {
      mockSierraClient.addPatron(testPatronRecord, testPatronPassword);
      const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
        expect(mockSierraClient.validateCredentials).toHaveBeenCalledWith(
          testPatronRecord.barcode.toString(),
          testPatronPassword
        );
        done();
      };
      login(testPatronRecord.email, testPatronPassword, callback);
    });
  });
});
