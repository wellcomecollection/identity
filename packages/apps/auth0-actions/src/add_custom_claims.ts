import { Auth0User } from '@weco/auth0-client';
import { Event, API } from './types/post-login';

// Custom claims MUST be namespaced with a URL as per the OIDC spec
// https://auth0.com/docs/security/tokens/json-web-tokens/create-namespaced-custom-claims
const CLAIM_NAMESPACE = 'https://wellcomecollection.org';
const BARCODE_CLAIM = `${CLAIM_NAMESPACE}/patron_barcode`;

export const onExecutePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  const barcode = event.user.app_metadata?.barcode;
  if (barcode) {
    api.accessToken.setCustomClaim(BARCODE_CLAIM, barcode);
    api.idToken.setCustomClaim(BARCODE_CLAIM, barcode);
  }
};
