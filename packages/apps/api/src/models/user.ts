import { Auth0Profile } from '@weco/auth0-client/lib/auth0';
import { PatronRecord } from '@weco/sierra-client/lib/patron';

export function toUser(patronRecord: PatronRecord, auth0Profile: Auth0Profile): User {
  return {
    userId: auth0Profile.userId,
    barcode: patronRecord.barcode,
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

interface User {
  userId: number,
  barcode: string,
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
