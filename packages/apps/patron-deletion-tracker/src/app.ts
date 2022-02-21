import { SierraClient } from '@weco/sierra-client';
import { Auth0Client } from '@weco/auth0-client';
import { ResponseStatus } from '@weco/identity-common';
import { ScheduledHandler } from 'aws-lambda';
import { startOfYesterday, endOfYesterday } from 'date-fns';
import { rateLimit } from './rate-limits';

const auth0RateLimited = rateLimit({
  // See https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy/management-api-endpoint-rate-limits#self-service-subscription-limits
  rateLimits: {
    minute: 200,
    second: 20,
  },
  maxConcurrency: 5,
});

// The time before the Lambda will exit at which we should log an error that we
// won't be able to complete the deletions
const lambdaExitThreshold = 2000;

export const createApp = (
  auth0Client: Auth0Client,
  sierraClient: SierraClient
): ScheduledHandler => async (event, context) => {
  const deletedPatronsResponse = await sierraClient.getDeletedRecordNumbers({
    start: startOfYesterday(),
    end: endOfYesterday(),
  });
  if (deletedPatronsResponse.status !== ResponseStatus.Success) {
    throw new Error(
      'Could not fetch deleted patron record numbers: ' +
        deletedPatronsResponse.message
    );
  }

  const deletedRecordNumbers = deletedPatronsResponse.result;
  console.log(`Found ${deletedRecordNumbers.length} patron records to delete`);

  const remaining = new Set(deletedRecordNumbers);
  await auth0RateLimited(
    deletedRecordNumbers.map((recordNumber) => async () => {
      if (context.getRemainingTimeInMillis() < lambdaExitThreshold) {
        throw new Error(
          `Lambda is about to exit and may not have deleted some records: ${Array.from(
            remaining
          ).join(', ')}`
        );
      }
      await auth0Client.deleteUser(recordNumber);
      remaining.delete(recordNumber);
    })
  );
  if (remaining.size !== 0) {
    throw new Error(
      `Something went wrong, some records were not deleted: ${Array.from(
        remaining
      ).join(', ')}`
    );
  }

  console.log('Finished deleting records');
};
