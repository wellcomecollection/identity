import { isNonBlank } from '@weco/identity-common';

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
    updatedDate: auth0User.updated_at ? auth0User.updated_at : null,
    locked: !!(auth0User.blocked), // Auth0 quirk - this attribute doesn't appear on Auth0 responses until it's been toggled at least once.
    lastLoginDate: auth0User.last_login ? auth0User.last_login : null,
    lastLoginIp: auth0User.last_ip ? auth0User.last_ip : null,
    totalLogins: auth0User.logins_count ? auth0User.logins_count : 0,
    metadata: auth0User.app_metadata ? auth0User.app_metadata : null
  }
}

export function toAuth0SearchResults(page: number, sort: string, sortDir: number, name: string | undefined, email: string | undefined, status: string | undefined, auth0SearchResults: any): Auth0SearchResults {
  return {
    page: page,
    pageSize: auth0SearchResults.length,
    pageCount: Math.ceil(auth0SearchResults.total / auth0SearchResults.limit),
    totalResults: auth0SearchResults.total,
    sort: sort,
    sortDir: sortDir,
    name: name,
    email: email,
    status: status,
    results: toAuth0Profiles(auth0SearchResults.users)
  }
}

function toAuth0Profiles(users: any[]): Auth0Profile[] {
  const auth0Profiles: Auth0Profile[] = [];
  users.forEach(user => {
    try {
      auth0Profiles.push(toAuth0Profile(user));
    } catch (e) {
      console.log('An error occurred converting Auth0 user [' + JSON.stringify(user) + '] to Auth0Profile: [' + e + ']');
    }
  });
  return auth0Profiles;
}

function extractUserId(value: string): string {
  if (value.startsWith(SierraUserIdPrefix)) {
    const userId: string = value.slice(value.indexOf(SierraUserIdPrefix) + SierraUserIdPrefix.length);
    if (isNaN(Number(userId))) {
      throw new Error('Invalid user ID field, cannot extract numerical ID from [' + value + ']');
    }
    return userId;
  } else if (value.startsWith(AzureUserIdPrefix)) {
    return value.slice(value.indexOf(AzureUserIdPrefix) + AzureUserIdPrefix.length);
  } else {
    throw new Error('Unexpected format for user ID [' + value + ']');
  }
}

export function generateUserSearchQuery(name: string | undefined, email: string | undefined, status: string | undefined): string {

  let query: string[] = ['identities.connection:"Sierra-Connection"'];

  if (!name && !email && !status) {
    return ''; // Auth0 API treats this is an unfiltered search - return everything
  }

  if (name) {
    query.push(...name.split(' ').map(token => 'name:*' + token + '*'));
  }

  if (email) {
    query.push(...email.split(' ').map(token => 'email:*' + token + '*'));
  }

  if (status) {
    if (status === 'active') {
      // Auth0 again - records that have never been toggled to / from the blocked status, won't have a 'blocked' field
      // on them, so we test if the flag is either 'false', or if that field doesn't exist.
      query.push('(blocked:false OR -blocked)')
    } else if (status === 'locked') {
      query.push('blocked:true')
    } else if (status === 'deletePending') {
      query.push('app_metadata.deleteRequested:*')
    }
  }

  return query.join(' AND ');
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
  updatedDate: string,
  lastLoginDate: string | null,
  lastLoginIp: string | null,
  totalLogins: number | null,
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
  name: string | undefined,
  email: string | undefined,
  status: string | undefined,
  results: Auth0Profile[]
}

export const Auth0SearchSortFields = new Map<string, string>([
  ['userId', 'user_id'],
  ['name', 'name'],
  ['email', 'email'],
  ['lastLogin', 'last_login'],
  ['locked', 'blocked']
]);

export const SierraConnection = 'Sierra-Connection';

export const SierraUserIdPrefix = 'auth0|p';
export const AzureUserIdPrefix = 'oauth2|AzureAD-Connection|';

export const SearchStatuses: string[] = ["active", "locked", "deletePending"];
