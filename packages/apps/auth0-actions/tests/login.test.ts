import {
  errorResponse,
  ResponseStatus,
  successResponse,
} from '@weco/identity-common';
import { User } from 'auth0';
import login from '../src/login';
import { patronRecordToUser } from '../src/patronRecordToUser';

const mockGetPatronRecordByEmail = jest.fn();
const mockValidateCredentials = jest.fn();
jest.mock('@weco/sierra-client', () =>
  jest.fn().mockImplementation(() => ({
    getPatronRecordByEmail: mockGetPatronRecordByEmail,
    validateCredentials: mockValidateCredentials,
  }))
);

const testPatronRecord = {
  recordNumber: 1234567,
  barcode: '7654321',
  firstName: 'Test',
  lastName: 'Testing',
  email: 'test@test.test',
};

describe('login script', () => {
  it('throws a credentials error if the user does not exist in Sierra', (done) => {
    mockGetPatronRecordByEmail.mockResolvedValueOnce(
      errorResponse('not found', ResponseStatus.NotFound)
    );

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(data).toBe(undefined);
      expect(error).toBeInstanceOf(WrongUsernameOrPasswordError);
      done();
    };
    login('', '', callback);
  });

  it('throws an error if Sierra returns an error', (done) => {
    mockGetPatronRecordByEmail.mockResolvedValueOnce(
      errorResponse('bad computer', ResponseStatus.UnknownError)
    );

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(data).toBe(undefined);
      expect(error).not.toBeInstanceOf(WrongUsernameOrPasswordError);
      expect(error).toBeInstanceOf(Error);
      done();
    };
    login('', '', callback);
  });

  it('throws a credentials error if Sierra credentials validation fails', (done) => {
    mockGetPatronRecordByEmail.mockResolvedValueOnce(
      successResponse(testPatronRecord)
    );
    mockValidateCredentials.mockResolvedValueOnce(
      errorResponse('invalid credentials', ResponseStatus.InvalidCredentials)
    );

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(data).toBe(undefined);
      expect(error).toBeInstanceOf(WrongUsernameOrPasswordError);
      done();
    };
    login('', '', callback);
  });

  it('returns a user object populated by the patron record if validation succeeds', (done) => {
    mockGetPatronRecordByEmail.mockResolvedValueOnce(
      successResponse(testPatronRecord)
    );
    mockValidateCredentials.mockResolvedValueOnce(successResponse({}));

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(error).toBe(null);
      expect(data).toEqual(patronRecordToUser(testPatronRecord));
      done();
    };
    login('', '', callback);
  });

  describe('calls the Sierra client correctly', () => {
    const loginEmail = 'test@test.test';
    const loginPassword = 'testpassword';

    it('by searching for the given email', (done) => {
      const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
        expect(mockGetPatronRecordByEmail).toHaveBeenCalledWith(loginEmail);
        done();
      };
      login(loginEmail, loginPassword, callback);
    });

    it('by validating the given password with the resolved patron barcode', (done) => {
      mockGetPatronRecordByEmail.mockResolvedValueOnce(
        successResponse(testPatronRecord)
      );
      const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
        expect(mockValidateCredentials).toHaveBeenCalledWith(
          testPatronRecord.barcode.toString(),
          loginPassword
        );
        done();
      };
      login(loginEmail, loginPassword, callback);
    });
  });
});
