import { patronRecordToUser } from '../src/helpers';
import { PatronRecord } from '@weco/sierra-client';

const testPatronRecord: PatronRecord = {
  recordNumber: 1234567,
  barcode: '1234567',
  firstName: 'Test',
  lastName: 'Testing',
  email: 'test@test.test',
  role: 'Reader',
  verifiedEmails: [],
};

describe('patronRecordToUser', () => {
  it('correctly creates an Auth0 user object from a patron record', () => {
    const result = patronRecordToUser(testPatronRecord);
    expect(result).toEqual({
      user_id: 'p1234567',
      email: 'test@test.test',
      name: 'Test Testing',
      given_name: 'Test',
      family_name: 'Testing',
      app_metadata: {
        barcode: '1234567',
        role: 'Reader',
      },
    });
  });
});
