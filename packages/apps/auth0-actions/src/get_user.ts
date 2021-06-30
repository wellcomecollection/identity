import SierraClient from '@weco/sierra-client';
import { ResponseStatus } from '@weco/identity-common';
import { callbackify } from 'util';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

async function getUser(email) {
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new SierraClient(apiRoot, clientKey, clientSecret);

  const patronRecordResponse = await sierraClient.getPatronRecordByEmail(email);

  if (patronRecordResponse.status === ResponseStatus.Success) {
    const patronRecord = patronRecordResponse.result;
    return {
      user_id: 'p' + patronRecord.recordNumber,
      email: patronRecord.email,
      name: patronRecord.firstName + ' ' + patronRecord.lastName,
      given_name: patronRecord.firstName,
      family_name: patronRecord.lastName,
    };
  } else if (patronRecordResponse.status === ResponseStatus.NotFound) {
    return undefined;
  } else {
    throw patronRecordResponse;
  }
}

export default callbackify(getUser);
