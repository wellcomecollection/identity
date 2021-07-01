import SierraClient from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';
import { patronRecordToUser } from './patronRecordToUser';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

export async function getUser(email: string) {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new SierraClient(apiRoot, clientKey, clientSecret);

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
