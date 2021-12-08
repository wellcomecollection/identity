import { callbackify } from 'util';

async function deleteUser(id: string) {
  // We don't actually want to delete the user from Sierra
  console.log('User deleted: ', id);
}

export default callbackify(deleteUser);
