import { choosePrincipalId } from './handler';

describe('choosePrincipalId', () => {
  it('uses a Sierra patron ID if provided', () => {
    const token = {
      header: {
        alg: 'RS256',
        typ: 'JWT',
      },
      signature: '',
      payload: {
        sub: 'auth0|p1234567',
      },
    };

    expect(choosePrincipalId(token)).toBe('1234567');
  });

  it('sets a machine ID if we’re in the client-credentials flow', () => {
    const token = {
      header: {
        alg: 'RS256',
        typ: 'JWT',
      },
      signature: '',
      payload: {
        sub: '1234567@clients',
      },
    };

    expect(choosePrincipalId(token)).toBe('@machine');
  });

  it('returns the subject unmodified if it can’t identify a principal', () => {
    const token = {
      header: {
        alg: 'RS256',
        typ: 'JWT',
      },
      signature: '',
      payload: {
        sub: 'mysterySubject',
      },
    };
    expect(choosePrincipalId(token)).toBe('mysterySubject');
  });

  it('returns an empty string if the subject is missing', () => {
    const token = {
      header: {
        alg: 'RS256',
        typ: 'JWT',
      },
      signature: '',
      payload: {
        sub: undefined,
      },
    };
    expect(choosePrincipalId(token)).toBe('');
  });
});
