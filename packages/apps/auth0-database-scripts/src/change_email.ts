import { HttpSierraClient } from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';
import { recordNumberForEmail } from './helpers';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

// See https://auth0.com/docs/connections/database/custom-db/templates/change-email
async function changeEmail(
  email: string,
  newEmail: string,
  verified: boolean
): Promise<boolean> {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);
  const recordNumber = await recordNumberForEmail(email, sierraClient);

  if (!recordNumber) {
    return false;
  }

  const patronRecordUpdate = await sierraClient.updatePatronEmail(
    recordNumber,
    newEmail,
    verified
  );
  if (patronRecordUpdate.status !== ResponseStatus.Success) {
    throw new Error(patronRecordUpdate.message);
  }

  return true;
}

export default callbackify(changeEmail);
