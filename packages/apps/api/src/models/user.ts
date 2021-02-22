import { Auth0Profile, Auth0SearchResults } from '@weco/auth0-client/lib/auth0';
import { PatronRecord } from '@weco/sierra-client/lib/patron';

export function toUser(auth0Profile: Auth0Profile, patronRecord?: PatronRecord): User {
  return {
    userId: Number(auth0Profile.userId), // @TODO is this safe?
    barcode: patronRecord ? patronRecord.barcode : null,
    firstName: auth0Profile.firstName,
    lastName: auth0Profile.lastName,
    email: auth0Profile.email,
    emailValidated: auth0Profile.emailValidated,
    locked: auth0Profile.locked,
    creationDate: auth0Profile.creationDate,
    updatedDate: auth0Profile.updatedDate,
    lastLoginDate: auth0Profile.lastLoginDate,
    lastLoginIp: auth0Profile.lastLoginIp,
    totalLogins: auth0Profile.totalLogins,
    deleteRequested: auth0Profile.metadata?.deleteRequested
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
    name: auth0SearchResults.name,
    email: auth0SearchResults.email,
    status: auth0SearchResults.status,
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
  updatedDate: string,
  lastLoginDate: string | null,
  lastLoginIp: string | null,
  totalLogins: number | null,
  deleteRequested: string | null
}

interface SearchResults {
  page: number,
  pageSize: number,
  pageCount: number,
  totalResults: number,
  sort: string,
  sortDir: number,
  name: string | undefined,
  email: string | undefined,
  status: string | undefined,
  results: User[]
}
