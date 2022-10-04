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
  console.log(`Entering getUser(${email})`);
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
  } else if (patronRecordResponse.status === ResponseStatus.DuplicateUsers) {
    throw new ValidationError(
      email,
      'There is an issue with this library account. To resolve this, please contact Library Enquiries (library@wellcomecollection.org)'
    );
  } else {
    throw new Error(patronRecordResponse.message);
  }
}

export default callbackify(getUser);
