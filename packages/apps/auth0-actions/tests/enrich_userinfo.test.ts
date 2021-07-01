import { IAuth0RuleContext } from '@tepez/auth0-rules-types';
import enrichUserInfo, { EmptyUser } from '../src/enrich_userinfo';

describe('enrich userinfo script', () => {
  it('adds an ID token with is_admin = false to the context for a Sierra connection', (done) => {
    const callback = (
      error: NodeJS.ErrnoException | null,
      user?: EmptyUser,
      context?: IAuth0RuleContext
    ) => {
      expect(error).toBe(null);
      expect(context?.idToken['https://wellcomecollection.org/'].is_admin).toBe(
        false
      );
      done();
    };
    enrichUserInfo(
      {} as EmptyUser,
      { connection: 'Sierra-Connection' } as IAuth0RuleContext,
      callback
    );
  });

  it('adds an ID token with is_admin = true to the context for an AzureAD connection', (done) => {
    const callback = (
      error: NodeJS.ErrnoException | null,
      user?: EmptyUser,
      context?: IAuth0RuleContext
    ) => {
      expect(error).toBe(null);
      expect(context?.idToken['https://wellcomecollection.org/'].is_admin).toBe(
        true
      );
      done();
    };
    enrichUserInfo(
      {} as EmptyUser,
      { connection: 'AzureAD-Connection' } as IAuth0RuleContext,
      callback
    );
  });

  it('does nothing to the context for other connection IDs', (done) => {
    const initialContext = { connection: 'Test-Connection' };
    const callback = (
      error: NodeJS.ErrnoException | null,
      user?: EmptyUser,
      context?: IAuth0RuleContext
    ) => {
      expect(error).toBe(null);
      expect(context).toEqual(initialContext);
      done();
    };
    enrichUserInfo(
      {} as EmptyUser,
      initialContext as IAuth0RuleContext,
      callback
    );
  });
});
