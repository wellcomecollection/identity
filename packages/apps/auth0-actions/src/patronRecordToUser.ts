import { PatronRecord } from '@weco/sierra-client';

export const patronRecordToUser = (patronRecord: PatronRecord) => ({
  user_id: 'p' + patronRecord.recordNumber,
  email: patronRecord.email,
  name: patronRecord.firstName + ' ' + patronRecord.lastName,
  given_name: patronRecord.firstName,
  family_name: patronRecord.lastName,
});
