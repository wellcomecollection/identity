import { errorResponse, ResponseStatus } from '@weco/identity-common';
import { MockSierraClient } from '@weco/sierra-client';
import { User } from 'auth0';
import getUser from '../src/get_user';
import { patronRecordToUser } from '../src/patronRecordToUser';

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

describe('get user script', () => {
  afterEach(() => {
    mockSierraClient.reset();
  });

  it('returns nothing if the user does not exist in Sierra', (done) => {
    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(error).toBe(null);
      expect(data).toBe(undefined);
      done();
    };
    getUser('', callback);
  });

  it('throws an error if Sierra returns an error', (done) => {
    mockSierraClient.getPatronRecordByEmail.mockResolvedValueOnce(
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
    const testRecord = MockSierraClient.randomPatronRecord();
    mockSierraClient.addPatron(testRecord);

    const callback = (error?: NodeJS.ErrnoException | null, data?: User) => {
      expect(error).toBe(null);
      expect(data).toEqual(patronRecordToUser(testRecord));
      done();
    };
    getUser(testRecord.email, callback);
  });
});
