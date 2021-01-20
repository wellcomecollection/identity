import { Auth0Profile } from '@weco/auth0-client/lib/auth0';
import { PatronRecord } from '@weco/sierra-client/lib/patron';

export function toUser(patronRecord: PatronRecord, auth0Profile: Auth0Profile): User {
  return {
    patronId: patronRecord.recordNumber,
    barcode: patronRecord.barcode,
    firstName: patronRecord.firstName,
    lastName: patronRecord.lastName,
    email: patronRecord.email,
    emailValidated: auth0Profile.emailValidated,
    locked: auth0Profile.locked,
    creationDate: auth0Profile.creationDate,
    lastLogin: auth0Profile.lastLogin,
    lastLoginIp: auth0Profile.lastLoginIp,
    totalLogins: auth0Profile.totalLogins
  }
}

interface User {
  patronId: number,
  barcode: string,
  firstName: string,
  lastName: string,
  email: string,
  emailValidated: boolean,
  locked: boolean,
  creationDate: string,
  lastLogin: string,
  lastLoginIp: string,
  totalLogins: number
}
