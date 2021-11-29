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

export const hasScopes = (...requiredScopes: string[]): AccessControlRule => (
  jwt,
  parameters
) => {
  const tokenScopes: string[] = jwt.payload.scope?.split(' ') || [];
  return tokenScopes.some((tokenScope) => requiredScopes.includes(tokenScope));
};

export const isSelf: AccessControlRule = (jwt, parameters) => {
  const tokenSubject = jwt.payload.sub;
  const parameterId = parameters?.userId;
  return Boolean(
    parameterId && (parameterId === 'me' || parameterId === tokenSubject)
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
