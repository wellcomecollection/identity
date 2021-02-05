import { Auth0Profile, Auth0SearchResults } from '@weco/auth0-client/lib/auth0';
import { PatronRecord } from '@weco/sierra-client/lib/patron';

export function toUser(auth0Profile: Auth0Profile, patronRecord?: PatronRecord): User {
  return {
    userId: auth0Profile.userId,
    barcode: patronRecord ? patronRecord.barcode : null,
    firstName: auth0Profile.firstName,
    lastName: auth0Profile.lastName,
    email: auth0Profile.email,
    emailValidated: auth0Profile.emailValidated,
    locked: auth0Profile.locked,
    creationDate: auth0Profile.creationDate,
    lastLogin: auth0Profile.lastLogin,
    lastLoginIp: auth0Profile.lastLoginIp,
    totalLogins: auth0Profile.totalLogins
  }
}

export function toSearchResults(auth0SearchResults: Auth0SearchResults): SearchResults {
  return {
    page: auth0SearchResults.page,
    pageSize: auth0SearchResults.pageSize,
    pageCount: auth0SearchResults.pageCount,
    totalResults: auth0SearchResults.totalResults,
    sort: auth0SearchResults.sort,
    sortDir: auth0SearchResults.sortDir,
    query: auth0SearchResults.query,
    results: auth0SearchResults.results.map((result: Auth0Profile) => toUser(result))
  }
}

interface User {
  userId: number,
  barcode: string | null,
  firstName: string | null,
  lastName: string | null,
  email: string,
  emailValidated: boolean,
  locked: boolean,
  creationDate: string,
  lastLogin: string | null,
  lastLoginIp: string | null,
  totalLogins: number
}

interface SearchResults {
  page: number,
  pageSize: number,
  pageCount: number,
  totalResults: number,
  sort: string,
  sortDir: number,
  query: string,
  results: User[]
}
