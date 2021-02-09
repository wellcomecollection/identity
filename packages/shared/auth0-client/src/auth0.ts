import { azureUserIdPrefix, isNonBlank, sierraUserIdPrefix } from '@weco/identity-common';

export function toAuth0UserInfo(userInfo: any): Auth0UserInfo {

  // Mandatory Auth0 fields
  const sub: string = userInfo.sub;
  const name: string = userInfo.name;
  const email: string = userInfo.email;
  if (!isNonBlank(sub) || !isNonBlank(name) || !isNonBlank(email)) {
    throw new Error('One or more required UserInfo fields are missing. Have all necessary scopes been requested?')
  }

  return {
    userId: extractUserId(sub),
    name: name,
    firstName: userInfo.given_name ? userInfo.given_name : null,
    lastName: userInfo.family_name ? userInfo.family_name : null,
    email: email,
    additionalAttributes: userInfo['https://wellcomecollection.org/'] ? userInfo['https://wellcomecollection.org/'] : null
  }
}

export function toAuth0Profile(auth0User: any): Auth0Profile {

  // Mandatory Auth0 fields
  const userIdStr: string = auth0User.user_id;
  const name: string = auth0User.name;
  const email: string = auth0User.email;
  const creationDate: string = auth0User.created_at;
  if (!isNonBlank(userIdStr) || !isNonBlank(name) || !isNonBlank(email) || !isNonBlank(creationDate)) {
    throw new Error('One or more required UserProfile fields are missing. Have all necessary scopes been requested?')
  }

  return {
    userId: extractUserId(userIdStr),
    name: name,
    firstName: auth0User.given_name ? auth0User.given_name : null,
    lastName: auth0User.family_name ? auth0User.family_name : null,
    email: email,
    emailValidated: !!(auth0User.email_verified), // Auth0 quirk - this attribute doesn't appear on Auth0 responses until it's been toggled at least once.
    creationDate: creationDate,
    locked: !!(auth0User.blocked), // Auth0 quirk - this attribute doesn't appear on Auth0 responses until it's been toggled at least once.
    lastLogin: auth0User.last_login ? auth0User.last_login : null,
    lastLoginIp: auth0User.last_ip ? auth0User.last_ip : null,
    totalLogins: auth0User.logins_count ? auth0User.logins_count : 0,
    metadata: auth0User.app_metadata ? auth0User.app_metadata : null
  }
}

export function toAuth0SearchResults(page: number, sort: string, sortDir: number, query: string, auth0SearchResults: any): Auth0SearchResults {
  return {
    page: page,
    pageSize: auth0SearchResults.length,
    pageCount: Math.ceil(auth0SearchResults.total / auth0SearchResults.limit),
    totalResults: auth0SearchResults.total,
    sort: sort,
    sortDir: sortDir,
    query: query,
    results: auth0SearchResults.users.map((user: any) => toAuth0Profile(user))
  }
}

function extractUserId(value: string): string {
  if (value.startsWith(sierraUserIdPrefix)) {
    const userId: string = value.slice(value.indexOf(sierraUserIdPrefix) + sierraUserIdPrefix.length);
    if (isNaN(Number(userId))) {
      throw new Error('Invalid user ID field, cannot extract numerical ID from [' + value + ']');
    }
    return userId;
  } else if (value.startsWith(azureUserIdPrefix)) {
    return value.slice(value.indexOf(azureUserIdPrefix) + azureUserIdPrefix.length);
  } else {
    throw new Error('Unexpected format for user ID [' + value + ']');
  }
}

export function generateUserSearchQuery(query: string): string {
  return query.split(' ').map(token => 'name:*' + token + '* OR email:*' + token + '*').join(' ');
}

// A simple representation of the Auth0 user, using only the attributes we provide to Auth0 to create it.
export interface Auth0UserInfo {
  userId: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  additionalAttributes?: { [key: string]: any }
}

// An enhanced representation of the Auth0 user, it includes the various pieces of metadata which Auth0 provides about the user.
export interface Auth0Profile extends Auth0UserInfo {
  emailValidated: boolean,
  locked: boolean,
  creationDate: string,
  lastLogin: string | null,
  lastLoginIp: string | null,
  totalLogins: number,
  metadata?: { [key: string]: any }
}

// A container that represents Auth0 user search results.
export interface Auth0SearchResults {
  page: number,
  pageSize: number,
  pageCount: number,
  totalResults: number,
  sort: string,
  sortDir: number,
  query: string,
  results: Auth0Profile[]
}

export const Auth0SearchSortFields = new Map<string, string>([
  ['userId', 'user_id'],
  ['name', 'name'],
  ['email', 'email'],
  ['lastLogin', 'last_login'],
  ['locked', 'blocked']
]);
