import { HttpSierraClient } from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';
import { User } from 'auth0';
import { patronRecordToUser } from './helpers';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

const invalidCredentialsMessage =
  "We don't recognise the email and/or password you entered. Please check your entry and try again.";

async function login(email: string, password: string): Promise<User> {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);

  const patronRecordResponse = await sierraClient.getPatronRecordByEmail(email);
  if (patronRecordResponse.status === ResponseStatus.NotFound) {
    throw new WrongUsernameOrPasswordError(email, invalidCredentialsMessage);
  }
  if (patronRecordResponse.status !== ResponseStatus.Success) {
    throw new Error(patronRecordResponse.message);
  }

  const patronRecord = patronRecordResponse.result;
  const validationResponse = await sierraClient.validateCredentials(
    patronRecord.barcode,
    password
  );
  if (validationResponse.status !== ResponseStatus.Success) {
    throw new WrongUsernameOrPasswordError(email, invalidCredentialsMessage);
  }

  const user = patronRecordToUser(patronRecord);
  return {
    ...user,
    // This script executes when a user who is not found in the Auth0 database attempts to log in.
    // If it succeeds, the user can log in directly and their account is migrated to Auth0 using
    // this return value.
    // As such, we do not need users who pass this authentication to validate their emails: they
    // already have valid library accounts in Sierra.
    email_verified: true,
  };
}

export default callbackify(login);
