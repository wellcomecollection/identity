import { Auth0User } from '@weco/auth0-client';
import { Event, API } from './types/post-login';
import { callbackify } from 'util';


const REGISTRATION_FORM_URL = 'http://localhost:3000/account/registration';
const SUCCESS_URL = 'http://localhost:3000/account';

export const onExecutePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {

  // If the user has accepted the terms already, we don't need to do anything else
  if (event.user.app_metadata.terms_and_conditions_accepted) return;

  // We send the user straight to the full registration form after they first register email and password
  // In Identity App (Weco) we post the formData to updateUserAfterRegistration endpoint on Identity API
  // updateUserAfterRegistration calls sierra http client and creates a patron
  // updateUserAfterRegistration encodes formData and sends back to this auth0 action

  // TODO: Confirm if we need to add firstname and lastname or if endpoint does that for us and we only need to redirect
  // to success page on successful update of user in auth0 and sierra
  
  // the auth0 action continues below and adds firstname, username and if terms are accepted
  // auth0 action will then redirect to success page

  const sessionToken = api.redirect.encodeToken({
    // this token must match the one used in Idenity App (Weco)
    secret: event.secrets.AUTH0_ACTION_SECRET,
    payload: {
      iss: `https://${event.request.hostname}/`,
      sub: event.user.user_id,
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
    tokenParameterName: 'token',
  });

  api.user.setUserMetadata('first_name', payload['https://wellcomecollection.org/first_name']);
  api.user.setUserMetadata('last_name', payload['https://wellcomecollection.org/last_name']);
  api.user.setAppMetadata('terms_and_conditions_accepted', payload['https://wellcomecollection.org/terms_agreed']);
  api.redirect.sendUserTo(SUCCESS_URL, {query: {success: 'true'}})
};
