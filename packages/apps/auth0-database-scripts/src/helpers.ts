import { PatronRecord, SierraClient } from '@weco/sierra-client';
import type { Auth0User } from '@weco/auth0-client';
import { ResponseStatus } from '@weco/identity-common';

export const patronRecordToUser = (patronRecord: PatronRecord): Auth0User => ({
  user_id: 'p' + patronRecord.recordNumber,
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

export const recordNumberForEmail = async (
  email: string,
  sierraClient: SierraClient
): Promise<number | undefined> => {
  const patronRecordResponse = await sierraClient.getPatronRecordByEmail(email);

  if (patronRecordResponse.status === ResponseStatus.Success) {
    return patronRecordResponse.result.recordNumber;
  } else if (patronRecordResponse.status === ResponseStatus.NotFound) {
    // We return undefined rather than an error here because the Auth0 scripts
    // are not expected to treat a missing user as an error
    // See https://auth0.com/docs/connections/database/custom-db/templates/change-email
    //
    // > no corresponding second parameter (or one with a value of false) indicates that no
    // > password change was performed (possibly due to the user not being found)
    return undefined;
  } else {
    throw new Error(patronRecordResponse.message);
  }
};
