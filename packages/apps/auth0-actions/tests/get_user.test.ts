import {
  errorResponse,
  ResponseStatus,
  successResponse,
} from '@weco/identity-common';
import { User } from 'auth0';
import getUser from '../src/get_user';
import { patronRecordToUser } from '../src/patronRecordToUser';

const mockGetPatronRecordByEmail = jest.fn();
jest.mock('@weco/sierra-client', () =>
  jest.fn().mockImplementation(() => ({
    getPatronRecordByEmail: mockGetPatronRecordByEmail,
  }))
);

const testPatronRecord = {
  recordNumber: 1234567,
  barcode: '1234567',
  firstName: 'Test',
  lastName: 'Testing',
  email: 'test@test.test',
};

describe('get user script', () => {
  it('returns nothing if the user does not exist in Sierra', (done) => {
    mockGetPatronRecordByEmail.mockResolvedValueOnce(
      errorResponse('not found', ResponseStatus.NotFound)
    );

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(error).toBe(null);
      expect(data).toBe(undefined);
      done();
    };
    getUser('', callback);
  });

  it('throws an error if Sierra returns an error', (done) => {
    mockGetPatronRecordByEmail.mockResolvedValueOnce(
      errorResponse('bad computer', ResponseStatus.UnknownError)
    );

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(data).toBe(undefined);
      expect(error).toBeInstanceOf(Error);
      done();
    };
    getUser('', callback);
  });

  it('returns a user object populated by the patron record', (done) => {
    mockGetPatronRecordByEmail.mockResolvedValueOnce(
      successResponse(testPatronRecord)
    );

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(error).toBe(null);
      expect(data).toEqual(patronRecordToUser(testPatronRecord));
      done();
    };
    getUser('', callback);
  });
});
