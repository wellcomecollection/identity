import type { Auth0User } from '@weco/auth0-client';
import { Event, API } from './types/post-login';

// Custom claims MUST be namespaced with a URL as per the OIDC spec
// https://auth0.com/docs/security/tokens/json-web-tokens/create-namespaced-custom-claims
const CLAIM_NAMESPACE = 'https://wellcomecollection.org';

// Rather than always including our custom claims on tokens, we make them requestable
// by a namespaced scope (ie `weco:<claim>`)
const SCOPE_NAMESPACE = 'weco';

const barcodeName = 'patron_barcode';
const barcodeClaim = `${CLAIM_NAMESPACE}/${barcodeName}`;
const barcodeScope = `${SCOPE_NAMESPACE}:${barcodeName}`;

const roleName = 'patron_role';
const roleClaim = `${CLAIM_NAMESPACE}/${roleName}`;
const roleScope = `${SCOPE_NAMESPACE}:${roleName}`;

const hasScope = <T>(event: Event<T>, scope: string): boolean =>
  !!event.transaction?.requested_scopes?.includes(scope);

export const onExecutePostLogin = async (
  event: Event<Auth0User>,
  api: API<Auth0User>
) => {
  const barcode = event.user.app_metadata?.barcode;
  if (barcode && hasScope(event, barcodeScope)) {
    api.idToken.setCustomClaim(barcodeClaim, barcode);
  }

  const role = event.user.app_metadata?.role;
  if (role && hasScope(event, roleScope)) {
    api.idToken.setCustomClaim(roleClaim, role);
  }
};
