import { Auth0User } from '@weco/auth0-client';
import { HttpSierraClient } from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';
import { patronRecordToUser } from './helpers';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

async function getUser(email: string): Promise<Auth0User | undefined> {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);

  const patronRecordResponse = await sierraClient.getPatronRecordByEmail(email);

  if (patronRecordResponse.status === ResponseStatus.Success) {
    const patronRecord = patronRecordResponse.result;
    return patronRecordToUser(patronRecord);
  } else if (patronRecordResponse.status === ResponseStatus.NotFound) {
    return undefined;
  } else if (patronRecordResponse.status === ResponseStatus.MalformedRequest) {
    // Sierra returns status 409 for duplicate patrons, our error handling calls this a MalformedRequest
    // here we return undefined to fail silently to progress to login where we will catch the duplicate error
    return undefined;
  } else {
    throw new Error(patronRecordResponse.message);
  }
}

export default callbackify(getUser);
