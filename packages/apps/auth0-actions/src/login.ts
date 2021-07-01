import SierraClient from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';
import { patronRecordToUser } from './patronRecordToUser';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

const invalidCredentialsMessage =
  "We don't recognise the email and/or password you entered. Please check your entry and try again";

async function login(email: string, password: string) {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new SierraClient(apiRoot, clientKey, clientSecret);

  const patronRecordResponse = await sierraClient.getPatronRecordByEmail(email);
  if (patronRecordResponse.status === ResponseStatus.NotFound) {
    throw new WrongUsernameOrPasswordError(email, invalidCredentialsMessage);
  }
  if (patronRecordResponse.status !== ResponseStatus.Success) {
    throw new Error(patronRecordResponse.message);
  }

  const patronRecord = patronRecordResponse.result;
  const validationResponse = await sierraClient.validateCredentials(
    patronRecord.recordNumber.toString(),
    password
  );
  if (validationResponse.status !== ResponseStatus.Success) {
    throw new WrongUsernameOrPasswordError(email, invalidCredentialsMessage);
  }

  return patronRecordToUser(patronRecord);
}

export default callbackify(login);
