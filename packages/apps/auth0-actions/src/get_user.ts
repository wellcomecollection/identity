import { HttpSierraClient } from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';
import { patronRecordToUser } from './patronRecordToUser';
import { User } from 'auth0';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

async function getUser(email: string): Promise<User | undefined> {
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
  } else {
    throw new Error(patronRecordResponse.message);
  }
}

export default callbackify(getUser);
