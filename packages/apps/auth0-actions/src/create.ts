import { callbackify } from 'util';
import { Auth0User } from '@weco/auth0-client';

async function create(user: Auth0User) {
  // We don't (yet) create users in Auth0 so we don't need to create them in Sierra
  console.log('User created: ', user.user_id);
}

export default callbackify(create);
