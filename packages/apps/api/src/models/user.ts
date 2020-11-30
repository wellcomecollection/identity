import {PatronRecord} from "@weco/sierra-client/lib/patron";
import {Auth0Profile} from "@weco/auth0-client/lib/auth0";

export function toUser(patronRecord: PatronRecord, auth0User: Auth0Profile): User {
  return {
    patronId: patronRecord.recordNumber,
    barcode: patronRecord.barcode,
    title: patronRecord.title,
    firstName: patronRecord.firstName,
    lastName: patronRecord.lastName,
    email: patronRecord.emailAddress,
    emailValidated: auth0User.emailValidated,
    locked: auth0User.locked,
    creationDate: auth0User.creationDate,
    lastLogin: auth0User.lastLogin,
    lastLoginIp: auth0User.lastLoginIp,
    totalLogins: auth0User.totalLogins
  }
}

interface User {
  patronId: number,
  barcode: string,
  title: string,
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
  patronId: "123456",
  barcode: "654321",
  title: "Mr",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  emailValidated: true,
  locked: false,
  creationDate: "2020-11-01 00:00:00",
  lastLogin: "2020-11-01 12:00:00",
  lastLoginIp: "127.0.0.1",
  totalLogins: 120
};

export const DummyUserTwo = {
  patronId: "654321",
  barcode: "123456",
  title: "Mrs",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  emailValidated: true,
  locked: false,
  creationDate: "2020-11-11 00:00:00",
  lastLogin: "2020-11-11 12:00:00",
  lastLoginIp: "192.168.0.1",
  totalLogins: 240
};
