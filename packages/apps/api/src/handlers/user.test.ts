import { HttpError } from '../models/HttpError';
import { validateUserId } from './user';

describe('validateUserId', () => {
  it('allows an @machine user which isn’t me', () => {
    expect(
      validateUserId({ callerId: '@machine', paramUserId: '1234567' })
    ).toBe(1234567);
  });

  it('allows a matching caller/param ID pair', () => {
    expect(
      validateUserId({ callerId: '35059492', paramUserId: '35059492' })
    ).toBe(35059492);
  });

  it('allows a mixed type caller/param ID pair', () => {
    // In theory this is caught by the type system, but we can get
    // a number from the API Gateway authorizer.
    expect(
      validateUserId({ callerId: 35059492 as any, paramUserId: '35059492' })
    ).toBe(35059492);
  });

  it('allows a matching param ID of "me"', () => {
    expect(validateUserId({ callerId: '82699531', paramUserId: 'me' })).toBe(
      82699531
    );
  });

  it('rejects a non-numeric caller ID', () => {
    try {
      validateUserId({ callerId: 'nan', paramUserId: '2871681' });
    } catch (error) {
      const httpError = error as HttpError;
      expect(httpError.status).toBe(401);
      expect(httpError.message).toBe('Request was not authorised');
    }
  });

  it('rejects a non-numeric param ID', () => {
    try {
      validateUserId({ callerId: '39761198', paramUserId: 'nan' });
    } catch (error) {
      const httpError = error as HttpError;
      expect(httpError.status).toBe(401);
      expect(httpError.message).toBe('Request was not authorised');
    }
  });
});
