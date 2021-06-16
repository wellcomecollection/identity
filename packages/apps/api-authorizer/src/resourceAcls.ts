import { Auth0UserInfo } from '@weco/auth0-client/src/auth0';

export type ResourceAclMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ResourceAclCheck = (
  auth0UserInfo: Auth0UserInfo,
  pathParameters: Record<string, string | undefined> | null
) => boolean;
type ResourceAcls = Record<
  string,
  Partial<Record<ResourceAclMethod, ResourceAclCheck>>
>;

export const isAdministrator = function (
  auth0UserInfo: Auth0UserInfo,
  pathParameters: Record<string, string | undefined> | null
): boolean {
  return auth0UserInfo.additionalAttributes?.is_admin ?? false;
};

export const isSelf = function (
  auth0UserInfo: Auth0UserInfo,
  pathParameters: Record<string, string | undefined> | null
): boolean {
  return (
    pathParameters?.userId === 'me' ||
    pathParameters?.userId === auth0UserInfo.userId.toString()
  );
};

const anyOf = (...checks: ResourceAclCheck[]): ResourceAclCheck => (
  info,
  params
) => checks.some((check) => check(info, params));

const resourceAcls: ResourceAcls = {
  '/users': {
    GET: isAdministrator,
  },
  '/users/{userId}': {
    GET: anyOf(isSelf, isAdministrator),
    PUT: anyOf(isSelf, isAdministrator),
    DELETE: isAdministrator,
  },
  '/users/{userId}/password': {
    PUT: isSelf,
  },
  '/users/{userId}/send-verification': {
    PUT: isAdministrator,
  },
  '/users/{userId}/lock': {
    PUT: isAdministrator,
    DELETE: isAdministrator,
  },
  '/users/{userId}/deletion-request': {
    PUT: isSelf,
    DELETE: isAdministrator,
  },
  '/users/{userId}/validate': {
    POST: isSelf,
  },
  '/users/{userId}/item-requests': {
    POST: isSelf,
    GET: isSelf,
  },
};

export default resourceAcls;
