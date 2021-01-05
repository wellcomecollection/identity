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


export const DummyUserOne = {
  patronId: 123456,
  barcode: '654321',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  emailValidated: true,
  locked: false,
  creationDate: '2020-11-01 00:00:00',
  lastLogin: '2020-11-01 12:00:00',
  lastLoginIp: '127.0.0.1',
  totalLogins: 120
};

export const DummyUserTwo = {
  patronId: 654321,
  barcode: '123456',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  emailValidated: true,
  locked: false,
  creationDate: '2020-11-11 00:00:00',
  lastLogin: '2020-11-11 12:00:00',
  lastLoginIp: '192.168.0.1',
  totalLogins: 240
};
