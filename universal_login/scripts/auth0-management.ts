import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getParameter, getSecret } from './aws';

export const environments = ['stage', 'prod'] as const;
export type Env = typeof environments[number];
type ClientCredentials = {
  clientId: string;
  clientSecret: string;
};

// This type mirrors the data returned from Auth0
// so does not follow camelCase conventions
type BearerToken = {
  // eslint-disable-next-line camelcase
  access_token: string;
  scope: string;
  // eslint-disable-next-line camelcase
  expires_in: number;
  // eslint-disable-next-line camelcase
  token_type: 'Bearer';
};

const apiHosts: Record<Env, string> = {
  stage: 'stage.account.wellcomecollection.org',
  prod: 'account.wellcomecollection.org',
};

export const getAuthenticatedInstance = async (
  env: Env
): Promise<AxiosInstance> => {
  const credentialsLocation = `identity/${env}/buildkite/credentials`;
  const credentials = await getSecret<ClientCredentials>(credentialsLocation);
  const auth0Hostname = await getParameter(`identity-auth0_domain-${env}`);

  const tokenEndpoint = `https://${auth0Hostname}/oauth/token`;
  const audience = `https://${auth0Hostname}/api/v2/`;

  const axiosResult: AxiosResponse<BearerToken> = await axios.post(
    tokenEndpoint,
    {
      grant_type: 'client_credentials',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      audience,
    },
    {
      headers: { 'content-type': 'application/json' },
    }
  );
  const token = axiosResult.data.access_token;

  return axios.create({
    baseURL: `https://${apiHosts[env]}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
