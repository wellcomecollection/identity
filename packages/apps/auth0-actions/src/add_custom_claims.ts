import { Auth0User } from '@weco/auth0-client';
import { Event, API } from './types/post-login';

export const onExecutePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  console.log('I am an action');
};
