import { Auth0User } from '@weco/auth0-client';
import { Event, API } from './types/post-login';
//in theory we should not need to be encoding and decoding token here as we will already be within the auth0
//session at the registration point - TODO: validate this

const SESSION_TOKEN_SECRET = 'tbc';
const CONSENT_FORM_URL = '/registration';
export const onExecutePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  const sessionToken = api.redirect.encodeToken({
    secret: SESSION_TOKEN_SECRET,
    payload: {
      iss: `https://${event.request.hostname}/`,
    },
  });

  api.redirect.sendUserTo(CONSENT_FORM_URL, {
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
  let newUser;

  //again we are not using a third party site in a sense, we should already have this info from the session
  try {
    newUser = api.redirect.validateToken({
      secret: SESSION_TOKEN_SECRET,
      tokenParameterName: 'session_token',
    });
  } catch (error) {
    console.log(error.message);
    return api.access.deny('Error occurred during redirect.');
  }

  //we need to get the custom form field entries back from decoded token'd url of form
  const customClaims = newUser.formData;

  if (customClaims['tos_accepted'] !== 'yes') {
    //stop the whole process if the patron hasn't accepted the terms
    api.access.deny(`You must accept the terms before continuing`);
  }

  //update the user
  for (const [key, value] of Object.entries(customClaims)) {
    api.user.setUserMetadata(key, value);
  }
};
