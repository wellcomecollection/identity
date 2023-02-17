import type { Auth0User } from '@weco/auth0-client';
import { Event, API } from './types/post-login';

// These are copied and pasted from identity-common, because compiling them
// into an action is non-trivial
// TODO: work out how to use Webpack to do this, like with the database scripts
const REGISTRATION_NAME_PREFIX = 'Auth0_Registration';
const hasTempName = (firstName: string, lastName: string): boolean =>
  firstName.startsWith(REGISTRATION_NAME_PREFIX) ||
  lastName.startsWith(REGISTRATION_NAME_PREFIX);

export const onExecutePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  const REGISTRATION_FORM_URL: string = `${event.secrets.IDENTITY_APP_BASEURL}/registration`;

  // - User first and last name are set to defaults starting `Auth0_Registration` in the `create` script
  // - If the user has their name set to something other than these defaults, we don't need to redirect them to registration
  const givenName = event.user.given_name;
  const familyName = event.user.family_name;
  const hasName = Boolean(givenName) && Boolean(familyName);
  if (hasName && !hasTempName(givenName!, familyName!)) {
    return;
  }

  // Send the user to the registration form in which they can provide their first/last name and
  // also accept terms and conditions. Pass their email to this form using a session token.
  //
  // The form action uses the Identity API to update first/last name in Sierra, after confirming
  // that T&Cs were accepted. After this, it redirects the user to the /continue endpoint, completing
  // the login flow

  const sessionToken = api.redirect.encodeToken({
    // this token must match the one used in Identity API
    secret: event.secrets.AUTH0_PAYLOAD_SECRET,
    payload: {
      email: event.user.email,
    },
  });

  try {
    api.redirect.sendUserTo(REGISTRATION_FORM_URL, {
      query: {
        session_token: sessionToken,
      },
    });
  } catch (error) {
    console.error(error, 'Redirection to full registration form failed');
  }
};

// We don't need to do anything here, but Auth0 requires us to export a function with
// this signature in order to support the login flow continuation
// https://auth0.com/docs/customize/actions/flows-and-triggers/login-flow/redirect-with-actions#resume-the-authentication-flow
export const onContinuePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {};
