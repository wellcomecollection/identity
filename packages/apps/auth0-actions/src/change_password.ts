import { callbackify } from 'util';
import { HttpSierraClient } from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { recordNumberForEmail } from './helpers';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

// See https://auth0.com/docs/connections/database/custom-db/templates/change-password

async function changePassword(
  email: string,
  newPassword: string
): Promise<boolean> {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);
  const recordNumber = await recordNumberForEmail(email, sierraClient);

  if (recordNumber) {
    const patronRecordUpdate = await sierraClient.updatePassword(
      recordNumber,
      newPassword
    );

    if (patronRecordUpdate.status !== ResponseStatus.Success) {
      throw new Error(patronRecordUpdate.message);
    }

    return true;
  }
  return false;
}

export default callbackify(changePassword);
