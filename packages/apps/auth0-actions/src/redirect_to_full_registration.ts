import { Auth0User } from '@weco/auth0-client';
import { Event, API } from './types/post-login';

export const onExecutePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  const envUrl = event.tenant.id.includes('stage')
    ? event.secrets.AUTH0_ACTION_URL_STAGE
    : event.secrets.AUTH0_ACTION_URL;
  const REGISTRATION_FORM_URL: string = `https://${envUrl}`;
  // If the user has accepted the terms, and we have their first and last name already, we don't need
  // to do anything else so bail out here
  if (
    event.user.app_metadata?.terms_and_conditions_accepted &&
    Boolean(event.user.given_name) &&
    Boolean(event.user.family_name)
  )
    return;

  // We send the user straight to the full registration form after they first register email and password
  // Full registration form has three fields aka formData: firstname, lastname and terms_and_conditions_accepted
  // In Identity App (Weco) we post the formData to updateUserAfterRegistration endpoint on Identity API
  // updateUserAfterRegistration updates auth0 user with formData firstname and lastname
  // updateUserAfterRegistration calls sierra http client and creates a patron with firstname and lastname
  // updateUserAfterRegistration encodes formData and sends back to this auth0 action
  // auth0 action we update terms_and_conditions_accepted boolean
  // auth0 action will then redirect to success page

  const sessionToken = api.redirect.encodeToken({
    // this token must match the one used in Identity API
    secret: event.secrets.AUTH0_ACTION_SECRET,
    payload: {
      iss: `https://${event.request.hostname}/`,
      sub: event.user.user_id,
    },
  });

  try {
    api.redirect.sendUserTo(REGISTRATION_FORM_URL, {
      query: {
        session_token: sessionToken,
        redirect_uri: `https://${event.request.hostname}/continue`,
      },
    });
  } catch (error) {
    console.error(error, 'Redirectiong to full registration form failed');
  }
};

// Handler that will be invoked when this action is resuming after an external redirect. If your
// onExecutePostLogin function does not perform a redirect, this function can be safely ignored.

export const onContinuePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  const envUrl = event.tenant.id.includes('stage')
    ? event.secrets.AUTH0_ACTION_URL_STAGE
    : event.secrets.AUTH0_ACTION_URL;
  const SUCCESS_URL = `https://${envUrl}/success`;

  // Once the full registration form has been submitted, it is signed with JWT handler on Identity App (Weco)
  // This jwt token is sent back to /continue on auth0 actions, and we validate/decode the token to get formData
  // On success of full registration form submission at Identity API updateUserAfterRegistration endpoint
  // we redirect to /continue with encoded formData from the endpoint
  // any data we send to /continue is tokenized and validated below

  const payload = api.redirect.validateToken({
    secret: event.secrets.AUTH0_ACTION_SECRET,
    tokenParameterName: 'token',
  });
  api.user.setAppMetadata(
    'terms_and_conditions_accepted',
    Boolean(event.user.app_metadata?.terms_and_conditions_accepted)
  );
  api.redirect.sendUserTo(SUCCESS_URL, { query: { success: 'true' } });
};
