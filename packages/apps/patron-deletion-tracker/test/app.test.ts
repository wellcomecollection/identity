import { Auth0User, MockAuth0Client } from '@weco/auth0-client';
import { MockSierraClient, PatronRecord } from '@weco/sierra-client';
import { createApp } from '../src/app';
import { setHours, startOfYesterday, subDays } from 'date-fns';
import { Context } from 'aws-lambda';
import { errorResponse, ResponseStatus } from '@weco/identity-common';

const mockClients = () => ({
  auth0: new MockAuth0Client(),
  sierra: new MockSierraClient(),
});

const patronRecordToAuth0User = (patronRecord: PatronRecord): Auth0User => ({
  user_id: patronRecord.recordNumber.toString(),
  email: patronRecord.email,
  name: patronRecord.firstName + ' ' + patronRecord.lastName,
  given_name: patronRecord.firstName,
  family_name: patronRecord.lastName,
  email_verified: patronRecord.verifiedEmail === patronRecord.email,
  app_metadata: {
    barcode: patronRecord.barcode,
    role: patronRecord.role,
  },
});

describe('patron deletion tracker', () => {
  it('deletes all patrons in Auth0 who were deleted in Sierra in the configured window', async () => {
    const { auth0, sierra } = mockClients();
    const deletedPatrons = Array.from({ length: 10 }).map(() => {
      const deletedPatron = MockSierraClient.randomPatronRecord();
      sierra.addPatron(deletedPatron);
      const deletedDate = setHours(
        startOfYesterday(),
        Math.floor(Math.random() * 24)
      );
      sierra.markDeleted(deletedPatron.recordNumber, deletedDate);
      auth0.addUser(patronRecordToAuth0User(deletedPatron));
      return deletedPatron;
    });
    const app = createApp(auth0, sierra);

    await app({ window: { durationDays: 1 } }, {
      getRemainingTimeInMillis: () => 30000,
    } as Context);

    for (const deletedPatron of deletedPatrons) {
      expect(auth0.contains(deletedPatron.recordNumber)).toBe(false);
    }
  });

  it('does not delete patrons who were deleted in Sierra outside of the configured window', async () => {
    const { auth0, sierra } = mockClients();
    const deletedPatron = MockSierraClient.randomPatronRecord();
    sierra.addPatron(deletedPatron);
    sierra.markDeleted(
      deletedPatron.recordNumber,
      subDays(startOfYesterday(), 10)
    );
    auth0.addUser(patronRecordToAuth0User(deletedPatron));
    const app = createApp(auth0, sierra);

    await app({ window: { durationDays: 9 } }, {
      getRemainingTimeInMillis: () => 30000,
    } as Context);

    expect(auth0.contains(deletedPatron.recordNumber)).toBe(true);
  });

  it('throws an error that occurs when fetching deleted patrons', async () => {
    const { auth0, sierra } = mockClients();
    const errorMessage = 'test: error fetching patrons';
    sierra.getDeletedRecordNumbers.mockRejectedValue(new Error(errorMessage));
    const app = createApp(auth0, sierra);

    await expect(
      app({ window: { durationDays: 1 } }, {
        getRemainingTimeInMillis: () => 30000,
      } as Context)
    ).rejects.toThrowError(errorMessage);
  });

  it('throws an error if the Auth0 client does not return a success', async () => {
    const { auth0, sierra } = mockClients();
    const deletedPatron = MockSierraClient.randomPatronRecord();
    sierra.addPatron(deletedPatron);
    sierra.markDeleted(deletedPatron.recordNumber, startOfYesterday());
    const errorMessage = 'test: error deleting patron';
    auth0.deleteUser.mockResolvedValue(
      errorResponse(errorMessage, ResponseStatus.InvalidCredentials)
    );
    const app = createApp(auth0, sierra);

    await expect(
      app({ window: { durationDays: 1 } }, {
        getRemainingTimeInMillis: () => 30000,
      } as Context)
    ).rejects.toThrowError(errorMessage);
  });

  it('throws errors that occur during deletion', async () => {
    const { auth0, sierra } = mockClients();
    const deletedPatron = MockSierraClient.randomPatronRecord();
    sierra.addPatron(deletedPatron);
    sierra.markDeleted(deletedPatron.recordNumber, startOfYesterday());
    const errorMessage = 'test: error deleting patron';
    auth0.deleteUser.mockRejectedValue(new Error(errorMessage));
    const app = createApp(auth0, sierra);

    await expect(
      app({ window: { durationDays: 1 } }, {
        getRemainingTimeInMillis: () => 30000,
      } as Context)
    ).rejects.toThrowError(errorMessage);
  });

  it('throws an error if remaining time becomes too low while deletions are in progress', async () => {
    const { auth0, sierra } = mockClients();
    const patronsToDelete = Array.from({ length: 20 }).map(() => {
      const deletedPatron = MockSierraClient.randomPatronRecord();
      sierra.addPatron(deletedPatron);
      const deletedDate = setHours(
        startOfYesterday(),
        Math.floor(Math.random() * 24)
      );
      sierra.markDeleted(deletedPatron.recordNumber, deletedDate);
      auth0.addUser(patronRecordToAuth0User(deletedPatron));
      return deletedPatron;
    });
    const app = createApp(auth0, sierra);

    const getRemainingTimeInMillis = jest.fn();
    for (let remainingTime = 10000; remainingTime >= 0; remainingTime -= 1000) {
      getRemainingTimeInMillis.mockReturnValueOnce(remainingTime);
    }

    const errorSpy = jest.spyOn(console, 'error');
    expect.hasAssertions();
    try {
      await app({ window: { durationDays: 1 } }, {
        getRemainingTimeInMillis,
      } as unknown as Context);
    } catch (error) {
      const message: string = errorSpy.mock.calls[0][0];
      const match = message.match(
        /Some records may not have been deleted: (?<recordsList>.+)/
      );
      expect(match).not.toBe(null);
      const warnedRecords: number[] = match!
        .groups!.recordsList!.split(', ')
        .map(Number);
      expect(warnedRecords).not.toHaveLength(0);

      // We don't know for sure that all of the records in the warning were not deleted, because the queue might've
      // successfully processed them while this error occurred. However - we do want to be sure that if we weren't
      // warned about a record, it was definitely deleted.
      const nonWarnedRecords = patronsToDelete.filter(
        (p) => !warnedRecords.includes(p.recordNumber)
      );
      for (const record of nonWarnedRecords) {
        expect(auth0.contains(record.recordNumber)).toBe(false);
      }
    }
  });
});
