import { callbackify } from 'util';
import { Auth0User } from '@weco/auth0-client';
import { HttpSierraClient } from '@weco/sierra-client';
import { patronRecordToUser, recordNumberForEmail } from './helpers';
import { ResponseStatus } from '@weco/identity-common';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

async function verify(email: string): Promise<Auth0User> {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);
  const recordNumber = await recordNumberForEmail(email, sierraClient);

  if (!recordNumber) {
    throw new Error(`Could not find patron with email ${email}`);
  }

  const verifiedPatronResponse = await sierraClient.markPatronEmailVerified(
    recordNumber
  );
  if (verifiedPatronResponse.status !== ResponseStatus.Success) {
    throw new Error(verifiedPatronResponse.message);
  }

  return patronRecordToUser(verifiedPatronResponse.result);
}

export default callbackify(verify);
