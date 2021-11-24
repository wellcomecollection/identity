import { PatronRecord, SierraClient } from '@weco/sierra-client';
import { User } from 'auth0';
import { ResponseStatus } from '@weco/identity-common';

export const patronRecordToUser = (patronRecord: PatronRecord): User => ({
  user_id: 'p' + patronRecord.recordNumber,
  email: patronRecord.email,
  name: patronRecord.firstName + ' ' + patronRecord.lastName,
  given_name: patronRecord.firstName,
  family_name: patronRecord.lastName,
});

export const recordNumberForEmail = async (
  email: string,
  sierraClient: SierraClient
): Promise<number | undefined> => {
  const patronRecordResponse = await sierraClient.getPatronRecordByEmail(email);

  if (patronRecordResponse.status === ResponseStatus.Success) {
    return patronRecordResponse.result.recordNumber;
  } else if (patronRecordResponse.status === ResponseStatus.NotFound) {
    return undefined;
  } else {
    throw new Error(patronRecordResponse.message);
  }
};
