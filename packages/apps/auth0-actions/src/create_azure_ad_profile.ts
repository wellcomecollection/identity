import axios from 'axios';
import { callbackify } from 'util';
import { User } from 'auth0';
import { User as MicrosoftGraphUser } from '@microsoft/microsoft-graph-types';
import { IAuth0RuleContext } from '@tepez/auth0-rules-types';

async function fetchUserProfile(
  accessToken: string
): Promise<MicrosoftGraphUser> {
  // Auth0's OAuth 2.0 integration scripts don't seem to support environment variables, so we have to hard code
  // API hostname.
  const response = await axios.get(
    'https://graph.microsoft.com/v1.0/me?$select=id,givenName,surname,mail',
    {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
      validateStatus: (status) => status === 200,
    }
  );
  return response.data;
}

async function createAzureAdProfile(
  accessToken: string,
  context: IAuth0RuleContext
): Promise<User> {
  const userProfile = await fetchUserProfile(accessToken);
  return {
    user_id: userProfile.id,
    email: userProfile.mail!,
    name: userProfile.givenName + ' ' + userProfile.surname,
    given_name: userProfile.givenName!,
    family_name: userProfile.surname!,
  };
}

export default callbackify(createAzureAdProfile);
