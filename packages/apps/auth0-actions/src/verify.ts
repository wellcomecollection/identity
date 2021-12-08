import { callbackify } from 'util';
import { Auth0User } from '@weco/auth0-client';

async function verify(email: string): Promise<Auth0User> {
  // Do some things
  return {} as Auth0User;
}

export default callbackify(verify);
