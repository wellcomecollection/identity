import { Auth0User } from '@weco/auth0-client';
import { Event, API } from './types/post-login';

export const onExecutePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  const REGISTRATION_FORM_URL: string = event.secrets.IDENTITY_APP_BASEURL;
  // We now temporarily set the user firstName and lastName in the create script
  // We need the below conditional to bail out of the redirect only if this is not a temporary name
  // Using Auth0_Registration_tempLastName is a better coverall, so we check against this
  // TODO: It would be good to improve this further by checking for app_metadata.terms_and_conditions_accepted here

  if (
    Boolean(event.user.given_name) &&
    Boolean(event.user.family_name) &&
    Boolean(event.user.family_name !== 'Auth0_Registration_tempLastName')
  ) {
    return;
  }

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
    secret: event.secrets.AUTH0_PAYLOAD_SECRET,
    payload: {
      iss: `https://${event.request.hostname}/`,
      sub: event.user.user_id,
      email: event.user.email,
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
    console.error(error, 'Redirection to full registration form failed');
  }
};

// Handler that will be invoked when this action is resuming after an external redirect. If your
// onExecutePostLogin function does not perform a redirect, this function can be safely ignored.

export const onContinuePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  const SUCCESS_URL = `${event.secrets.IDENTITY_APP_BASEURL}/success`;

  // Once the full registration form has been submitted, it is signed with JWT handler on Identity App (Weco)
  // This jwt token is sent back to /continue on auth0 actions, and we validate/decode the token to get formData
  // On success of full registration form submission at Identity API updateUserAfterRegistration endpoint
  // we redirect to /continue with encoded formData from the endpoint
  // any data we send to /continue is tokenized and validated below

  try {
    const payload = api.redirect.validateToken({
      secret: event.secrets.AUTH0_PAYLOAD_SECRET,
      tokenParameterName: 'token',
    });

    api.user.setAppMetadata(
      'terms_and_conditions_accepted',
      Boolean(payload.terms_and_conditions_accepted)
    );
    api.redirect.sendUserTo(SUCCESS_URL, { query: { success: 'true' } });
  } catch (error) {
    console.error(error, 'Validation of redirect token failed');
  }
};
