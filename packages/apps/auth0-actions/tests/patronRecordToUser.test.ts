import { patronRecordToUser } from '../src/patronRecordToUser';

const testPatronRecord = {
  recordNumber: 1234567,
  barcode: '1234567',
  firstName: 'Test',
  lastName: 'Testing',
  email: 'test@test.test',
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
    });
  });
});
