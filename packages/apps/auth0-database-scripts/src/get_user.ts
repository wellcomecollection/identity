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
    // If a user is not found in sierra, we should be able to create the user in
    // the next script that runs, 'create'
    return;
  } else {
    throw new Error(patronRecordResponse.message);
  }
}

export default callbackify(getUser);
