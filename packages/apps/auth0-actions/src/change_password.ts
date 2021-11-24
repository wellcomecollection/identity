import { callbackify } from 'util';

async function changePassword(
  email: string,
  newPassword: string
): Promise<boolean> {
  // Do some things
  return true;
}

export default callbackify(changePassword);
