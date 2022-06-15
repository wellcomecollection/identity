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

// const invalidCredentialsMessage =
//   "We don't recognise the email and/or password you entered. Please check your entry and try again.";

const notFoundPatronErrorMessage = 'We have not found the patron in Sierra';
const otherFindingSierraPatronErrorMessage =
  'There was some other error in finding the patron in Sierra';
const sierraPatronValidationErrorMessage =
  'We had an issue in running validation of the patron in Sierra';
const markingPatronVerifiedErrorMessage =
  'We encountered an error in marking the patron as verified in Sierra';

async function login(email: string, password: string): Promise<Auth0User> {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);

  const patronRecordResponse = await sierraClient.getPatronRecordByEmail(email);
  if (patronRecordResponse.status === ResponseStatus.NotFound) {
    throw new WrongUsernameOrPasswordError(email, notFoundPatronErrorMessage);
  }
  if (patronRecordResponse.status !== ResponseStatus.Success) {
    throw new Error(
      patronRecordResponse.message + ' ' + otherFindingSierraPatronErrorMessage
    );
  }

  const patronRecord = patronRecordResponse.result;
  const validationResponse = await sierraClient.validateCredentials(
    patronRecordResponse.result.barcode,
    password
  );
  if (validationResponse.status !== ResponseStatus.Success) {
    throw new WrongUsernameOrPasswordError(
      email,
      sierraPatronValidationErrorMessage
    );
  }

  // If a patron is logging in and has no verified emails, we can infer that
  // they're logging in for the first time: because the library signup process
  // requires that they set a password via email, we assume that their current
  // email address is verified, and mark it as such.
  if (!patronRecord.verifiedEmail) {
    console.log(
      'LOG >> login script >> line 53 >> We we able to find out the patron was not verified in Sierra '
    );
    const updatedRecordResponse = await sierraClient.markPatronEmailVerified(
      patronRecord.recordNumber,
      { type: 'Implicit' }
    );
    if (updatedRecordResponse.status !== ResponseStatus.Success) {
      throw new Error(
        updatedRecordResponse.message + ' ' + markingPatronVerifiedErrorMessage
      );
    }
    return patronRecordToUser(updatedRecordResponse.result);
  } else {
    return patronRecordToUser(patronRecord);
  }
}

export default callbackify(login);
