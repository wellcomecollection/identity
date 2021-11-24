import { callbackify } from 'util';

async function changeEmail(
  email: string,
  newEmail: string,
  verified: boolean
): Promise<boolean> {
  // Do some things
  return true;
}

export default callbackify(changeEmail);
