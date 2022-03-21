import { SierraClient } from '@weco/sierra-client';
import { Auth0Client } from '@weco/auth0-client';
import { ResponseStatus } from '@weco/identity-common';
import { Context } from 'aws-lambda';
import { rateLimit } from './rate-limits';
import { getSierraQueryOptions, WindowConfig } from './windows';

const auth0RateLimited = rateLimit({
  // See "Write Users" in the table at
  // https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy/management-api-endpoint-rate-limits#self-service-subscription-limits
  rateLimits: {
    minute: 200,
    second: 20,
  },
  // This is set by us (not enforced by Auth0) and is fairly arbitrary
  maxConcurrency: 5,
});

// The time before the Lambda will exit at which we should log an error that we
// won't be able to complete the deletions, telling us which records we might
// have missed.
const lambdaExitThreshold = 2000;

export type PatronDeletionEvent = {
  window: WindowConfig;
  dryRun?: boolean;
};

type PatronDeletionHandler = (
  event: PatronDeletionEvent,
  context: Context
) => Promise<void>;

export const createApp = (
  auth0Client: Auth0Client,
  sierraClient: SierraClient
): PatronDeletionHandler => async (event, context) => {
  const sierraQueryOptions = getSierraQueryOptions(event.window);
  const deletedPatronsResponse = await sierraClient.getDeletedRecordNumbers(
    sierraQueryOptions
  );
  if (deletedPatronsResponse.status !== ResponseStatus.Success) {
    throw new Error(
      'Could not fetch deleted patron record numbers: ' +
        deletedPatronsResponse.message
    );
  }

  const deletedRecordNumbers = deletedPatronsResponse.result;
  const nRecords = deletedRecordNumbers.length;
  console.log(`Found ${nRecords} patron records to delete`);

  const remaining = new Set(deletedRecordNumbers);
  try {
    await auth0RateLimited(
      deletedRecordNumbers.map((recordNumber, i) => async () => {
        if (context.getRemainingTimeInMillis() < lambdaExitThreshold) {
          throw new Error('Lambda is about to exit');
        }
        if (i % 100 === 0) {
          console.log(
            `[in progress] Deleted ${nRecords - remaining.size} of ${nRecords}`
          );
        }
        if (!event.dryRun) {
          console.log('Deleting ' + recordNumber);
          await auth0Client.deleteUser(recordNumber);
        } else {
          console.log(`[dry run] Deleted patron ${recordNumber}`);
        }
        remaining.delete(recordNumber);
      })
    );
  } catch (error) {
    if (remaining.size !== 0) {
      const remainingRecordsString = Array.from(remaining).join(', ');
      console.error(
        `Some records may not have been deleted: ${remainingRecordsString}`
      );
    }
    throw error;
  }
  console.log('Finished deleting records');
};
