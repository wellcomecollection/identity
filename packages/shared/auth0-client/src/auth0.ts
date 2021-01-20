export function toAuth0UserInfo(userInfo: any): Auth0UserInfo {
  const sub = userInfo.sub;
  return {
    // As far as the application is concerned, Auth0 ID's are identical to Sierra ID's. So remove the mandatory Auth0 prefix.
    userId: sub.slice(sub.indexOf('auth0|p') + 'auth0|p'.length),
    name: userInfo.name,
    firstName: userInfo.given_name,
    lastName: userInfo.family_name,
    email: userInfo.email
  }
}

export function toAuth0Profile(auth0User: any): Auth0Profile {
  return {
    // As far as the application is concerned, Auth0 ID's are identical to Sierra ID's. So remove the mandatory Auth0 prefix.
    userId: auth0User.user_id.slice(auth0User.user_id.indexOf('auth0|p') + 'auth0|p'.length),
    name: auth0User.name,
    firstName: auth0User.given_name,
    lastName: auth0User.family_name,
    email: auth0User.email,
    emailValidated: auth0User.email_verified,
    creationDate: auth0User.created_at,
    locked: !!(auth0User.blocked), // Auth0 quirk - this attribute doesn't appear on Auth0 responses until it's been toggled off and on at least once.
    // Some fields won't be available until after the user has logged in at least once...
    lastLogin: auth0User.last_login ? auth0User.last_login : '',
    lastLoginIp: auth0User.last_ip ? auth0User.last_ip : '',
    totalLogins: auth0User.logins_count ? auth0User.logins_count : 0
  }
}

// A simple representation of the Auth0 user, using only the attributes we provide to Auth0 to create it.
export interface Auth0UserInfo {
  userId: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
}

// An enhanced representation of the Auth0 user, it includes the various pieces of metadata which Auth0 provides about the user.
export interface Auth0Profile extends Auth0UserInfo {
  emailValidated: boolean,
  locked: boolean,
  creationDate: string,
  lastLogin: string,
  lastLoginIp: string,
  totalLogins: number
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
  ['name', 'name'],
  ['email', 'email'],
  ['lastLogin', 'last_login'],
  ['recordNumber', 'user_id']
]);

export function toAuth0SearchResults(page: number, sort: string, sortDir: number, query: string, auth0SearchResults: any): Auth0SearchResults {
  return {
    page: page,
    pageSize: auth0SearchResults.length,
    pageCount: Math.ceil(auth0SearchResults.total / auth0SearchResults.limit) - 1,
    totalResults: auth0SearchResults.total,
    sort: sort,
    sortDir: sortDir,
    query: query,
    results: auth0SearchResults.users.map((user: any) => {

    })
  }
}
