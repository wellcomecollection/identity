import { callbackify } from 'util';
import { User } from 'auth0';

async function create(user: User) {
  // We don't (yet) create users in Auth0 so we don't need to create them in Sierra
  console.log('User created: ', user.user_id);
}

export default callbackify(create);
