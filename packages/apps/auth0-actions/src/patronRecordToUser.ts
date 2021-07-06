import { PatronRecord } from '@weco/sierra-client';
import { User } from 'auth0';

export const patronRecordToUser = (patronRecord: PatronRecord): User => ({
  user_id: 'p' + patronRecord.recordNumber,
  email: patronRecord.email,
  name: patronRecord.firstName + ' ' + patronRecord.lastName,
  given_name: patronRecord.firstName,
  family_name: patronRecord.lastName,
});
