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
