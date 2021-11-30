import { Jwt } from 'jsonwebtoken';

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

export const userIdFromSubject = (
  subjectClaim?: string
): string | undefined => {
  const prefix = 'auth0|p';
  if (subjectClaim?.startsWith(prefix)) {
    return subjectClaim.slice(prefix.length);
  } else {
    return subjectClaim;
  }
};

export const hasScopes = (...requiredScopes: string[]): AccessControlRule => (
  jwt,
  parameters
) => {
  const tokenScopes: string[] = jwt.payload.scope?.split(' ') || [];
  return tokenScopes.some((tokenScope) => requiredScopes.includes(tokenScope));
};

export const isSelf: AccessControlRule = (jwt, parameters) => {
  const tokenUserId = userIdFromSubject(jwt.payload.sub);
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
