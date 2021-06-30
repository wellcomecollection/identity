import axios from 'axios';
import { callbackify } from 'util';

async function fetchUserProfile(accessToken: string) {
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

async function createAzureAdProfile(accessToken: string, context: any) {
  const userProfile = await fetchUserProfile(accessToken);
  return {
    user_id: userProfile.id,
    email: userProfile.mail,
    name: userProfile.givenName + ' ' + userProfile.surname,
    given_name: userProfile.givenName,
    family_name: userProfile.surname,
  };
}

export default callbackify(createAzureAdProfile);
