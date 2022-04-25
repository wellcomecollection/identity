import { Auth0User } from '@weco/auth0-client';
import { Event, API } from './types/post-login';
import { HttpSierraClient } from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};


const REGISTRATION_FORM_URL = 'http://localhost:3000/account/registration';
export const onExecutePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  // We send the user straight to the full registration form after they first register email and password
  // In Identity App (Weco) we decode the incoming session_token
  // on filling out and submitting the full registration form Identity App (Weco) will sign the payload tokenise with jwt
  const sessionToken = api.redirect.encodeToken({
    // this token must match the one used in Idenity App (Weco)
    secret: event.secrets.AUTH0_ACTION_SECRET,
    payload: {
      iss: `https://${event.request.hostname}/`,
      sub: event.client.client_id,
    },
  });

  api.redirect.sendUserTo(REGISTRATION_FORM_URL, {
    query: {
      session_token: sessionToken,
      redirect_uri: `https://${event.request.hostname}/continue`,
    },
  });
};

// Handler that will be invoked when this action is resuming after an external redirect. If your
// onExecutePostLogin function does not perform a redirect, this function can be safely ignored.

export const onContinuePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  // Once the full registration form has been submitted, it is signed with JWT handler on Identity App (Weco)
  // This jwt token is sent back to /continue on auth0 actions and we validate/decode the token to get formData
  const payload = api.redirect.validateToken({
    secret: event.secrets.AUTH0_ACTION_SECRET,
  });

  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;
  

  // TODO: take the payload firstName, Surname and termsandconditions and pass to Sierra to create a patron
  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);
  // const createPatron = await sierraClient.createPatron();
};
