import { Jwt } from 'jsonwebtoken';
import { auth0IdToPublic } from '@weco/auth0-client';

type HttpVerb =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT';

type AccessControlRule = (
  jwt: Jwt,
  parameters?: Record<string, string | undefined>
) => boolean;

type ResourceRules = {
  [path: string]: {
    [method in HttpVerb]?: AccessControlRule;
  };
};

export const hasScopes = (...requiredScopes: string[]): AccessControlRule => (
  jwt,
  parameters
) => {
  // JWTs can - per the spec - contain opaque/non-JSON payloads. Ours don't,
  // but doing this check keeps us faithful to the types we're given, as
  // after all a user could be providing a malformed JWT.
  if (typeof jwt.payload === 'string') {
    return false;
  }

  const tokenScopes: string[] = jwt.payload.scope?.split(' ') || [];
  return tokenScopes.some((tokenScope) => requiredScopes.includes(tokenScope));
};

export const isMachineUser: AccessControlRule = (jwt, parameters) => {
  if (typeof jwt.payload === 'string') {
    return false;
  }

  // This is relying on an implementation detail of the Auth0
  // client credentials flow:
  //
  //    - The subject field will be of the form "client ID@clients",
  //      e.g. "sub": "123@clients"
  //
  // This is belt-and-braces checking; we already trust the JWT.  We want
  // to make sure tokens aren't being used in unexpected places, because
  // machine-to-machine clients can modify *all* users, whereas users can
  // only modify themselves.
  //
  // If this breaks in future and we want a more robust way of checking
  // for machine users, we should use a custom claim.
  //
  // We already have code for adding custom claims; we'd need to add this
  // to an action tied to the client credentials flow.
  //
  // See
  // https://github.com/wellcomecollection/identity/blob/585882471c43b45b7578fab926fa384ca4e691dd/packages/apps/auth0-actions/src/add_custom_claims.ts
  // https://community.auth0.com/t/sub-claim-format-for-m2m-tokens/39451/5
  // https://wellcome.slack.com/archives/CUA669WHH/p1656055161485399
  return (jwt.payload.sub || '').endsWith('@clients');
};

export const isSelf: AccessControlRule = (jwt, parameters) => {
  if (typeof jwt.payload === 'string') {
    return false;
  }

  const tokenUserId = auth0IdToPublic(jwt.payload.sub);
  const parameterUserId = parameters?.userId;
  return Boolean(
    parameterUserId &&
      tokenUserId &&
      (parameterUserId === 'me' || parameterUserId === tokenUserId)
  );
};

export const allOf = (...rules: AccessControlRule[]): AccessControlRule => (
  jwt,
  parameters
) => rules.every((rule) => rule(jwt, parameters));

type ResourceValidatorParameters = {
  path: string;
  method: string;
  token: Jwt;
  parameters?: Record<string, string | undefined>;
};

export const resourceAuthorizationValidator = (rules: ResourceRules) => ({
  path,
  method,
  token,
  parameters,
}: ResourceValidatorParameters) =>
  Boolean(rules[path]?.[method as HttpVerb]?.(token, parameters));
