import { Auth0UserInfo } from '@weco/auth0-client';

export type ResourceAclMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ResourceAclCheckType = 'AND' | 'OR';
export type ResourceAclCheck = (
  auth0UserInfo: Auth0UserInfo,
  pathParameters: Record<string, string | undefined> | null
) => boolean;

export type ResourceAcl = {
  resource: string;
  methods: ResourceAclMethod[];
  check: ResourceAclCheck | Array<ResourceAclCheck>;
  checkType?: ResourceAclCheckType;
};

export const isAdministrator = function (
  auth0UserInfo: Auth0UserInfo,
  pathParameters: Record<string, string | undefined> | null
): boolean {
  // @ts-ignore is_admin isn't typed on additionalAttributes
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

const resourceAcls: ResourceAcl[] = [
  {
    resource: '/users',
    methods: ['GET'],
    check: isAdministrator,
  },
  {
    resource: '/users/{userId}',
    methods: ['GET', 'PUT'],
    check: [isSelf, isAdministrator],
    checkType: 'OR',
  },
  {
    resource: '/users/{userId}',
    methods: ['DELETE'],
    check: isAdministrator,
  },
  {
    resource: '/users/{userId}/password',
    methods: ['PUT'],
    check: [isSelf],
  },
  {
    resource: '/users/{userId}/send-verification',
    methods: ['PUT'],
    check: [isAdministrator],
  },
  {
    resource: '/users/{userId}/lock',
    methods: ['PUT', 'DELETE'],
    check: isAdministrator,
  },
  {
    resource: '/users/{userId}/deletion-request',
    methods: ['PUT'],
    check: isSelf,
  },
  {
    resource: '/users/{userId}/deletion-request',
    methods: ['DELETE'],
    check: isAdministrator,
  },
  {
    resource: '/users/{userId}/validate',
    methods: ['POST'],
    check: isSelf,
  },
];

export default resourceAcls;
