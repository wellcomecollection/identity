import { HttpSierraClient } from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';
import { patronRecordToUser } from './helpers';
import { Auth0User } from '@weco/auth0-client';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

const invalidCredentialsMessage =
  "We don't recognise the email and/or password you entered. Please check your entry and try again.";

const duplicateEmailCredentialMessage = 
"There is an issue with this library account. To resolve this, please contact the library team (library@wellcomecollection.org)."

async function login(email: string, password: string): Promise<Auth0User> {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);

  const patronRecordResponse = await sierraClient.getPatronRecordByEmail(email);
  if (patronRecordResponse.status === ResponseStatus.NotFound) {
    throw new WrongUsernameOrPasswordError(email, invalidCredentialsMessage);
  }
  if (patronRecordResponse.status === ResponseStatus.MalformedRequest) {
    throw new WrongUsernameOrPasswordError(email, invalidCredentialsMessage);
  }
  if (patronRecordResponse.status !== ResponseStatus.Success) {
    throw new Error(patronRecordResponse.message);
  }
  

  const patronRecord = patronRecordResponse.result;
  const validationResponse = await sierraClient.validateCredentials(
    patronRecordResponse.result.barcode,
    password
  );
  if (validationResponse.status !== ResponseStatus.Success) {
    throw new WrongUsernameOrPasswordError(email, invalidCredentialsMessage);
  }

  // If a patron is logging in and has no verified emails, we can infer that
  // they're logging in for the first time: because the library signup process
  // requires that they set a password via email, we assume that their current
  // email address is verified, and mark it as such.
  if (!patronRecord.verifiedEmail) {
    const updatedRecordResponse = await sierraClient.markPatronEmailVerified(
      patronRecord.recordNumber,
      { type: 'Implicit' }
    );
    if (updatedRecordResponse.status !== ResponseStatus.Success) {
      throw new Error(updatedRecordResponse.message);
    }
    return patronRecordToUser(updatedRecordResponse.result);
  } else {
    return patronRecordToUser(patronRecord);
  }
}

export default callbackify(login);
