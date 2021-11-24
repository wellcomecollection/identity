import { callbackify } from 'util';
import { User } from 'auth0';

async function changeEmail(email: string): Promise<User> {
  // Do some things
  return {};
}

export default callbackify(changeEmail);
