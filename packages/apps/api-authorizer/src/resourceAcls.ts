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
  '/users/{userId}': {
    GET: isSelf,
    PUT: isSelf,
  },
  '/users/{userId}/password': {
    PUT: isSelf,
  },
  '/users/{userId}/deletion-request': {
    PUT: isSelf,
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
