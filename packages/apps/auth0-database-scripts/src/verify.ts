import { callbackify } from 'util';
import { Auth0User } from '@weco/auth0-client';

async function verify(email: string): Promise<Auth0User> {
  return { email, email_verified: true } as Auth0User;
}

export default callbackify(verify);
