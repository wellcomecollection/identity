import { callbackify } from 'util';
import { User } from 'auth0';

async function verify(email: string): Promise<User> {
  // Do some things
  return {};
}

export default callbackify(verify);
