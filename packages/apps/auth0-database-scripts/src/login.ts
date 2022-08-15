import { HttpSierraClient, PatronRecord } from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';
import { patronRecordToUser } from './helpers';
import { Auth0User } from '@weco/auth0-client';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

const contactLibraryErrorMessage =
  'There was an error. Please email us at library@wellcomecollection.org if this problem persists.';

const hasImplicitlyVerifiedEmail = (patronRecord: PatronRecord): boolean => {
  // The old process for registering users using OPAC had an implicit step
  // to verify email addresses: users set their password via email, so if
  // they had an email address and a password, we know it's verified.
  //
  // The new process went live on 20 July 2022, so we require any users created
  // after to this date to explicitly verify through Auth0.
  const isNotVerified = !patronRecord.verifiedEmail;
  const predatesAuth0Signup =
    patronRecord.createdDate <= new Date('2022-07-19');

  return isNotVerified && predatesAuth0Signup;
};

async function login(email: string, password: string): Promise<Auth0User> {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);

  const patronRecordResponse = await sierraClient.getPatronRecordByEmail(email);
  if (patronRecordResponse.status === ResponseStatus.NotFound) {
    throw new WrongUsernameOrPasswordError(email, contactLibraryErrorMessage);
  }
  if (patronRecordResponse.status !== ResponseStatus.Success) {
    throw new Error(
      patronRecordResponse.message + ' ' + contactLibraryErrorMessage
    );
  }

  const patronRecord = patronRecordResponse.result;
  const validationResponse = await sierraClient.validateCredentials(
    patronRecordResponse.result.barcode,
    password
  );
  if (validationResponse.status !== ResponseStatus.Success) {
    throw new WrongUsernameOrPasswordError(email, contactLibraryErrorMessage);
  }

  if (hasImplicitlyVerifiedEmail(patronRecord)) {
    console.log('Patron’s email address is implicitly verified');
    const updatedRecordResponse = await sierraClient.markPatronEmailVerified(
      patronRecord.recordNumber,
      { type: 'Implicit' }
    );
    if (updatedRecordResponse.status !== ResponseStatus.Success) {
      throw new Error(
        updatedRecordResponse.message + ' ' + contactLibraryErrorMessage
      );
    }
    return patronRecordToUser(updatedRecordResponse.result);
  } else {
    return patronRecordToUser(patronRecord);
  }
}

export default callbackify(login);
