import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

type Token = {
  accessToken: string;
  expiresAt: number; // epoch seconds
};

// This is the leeway between when the token actually expires, and the time
// before that after which we'll request a new token
const tokenExpiryThreshold = 30;

export const authenticatedInstanceFactory = (
  getToken: () => Promise<Token>,
  getInstanceConfig: () => AxiosRequestConfig = () => ({})
) => {
  let instance: AxiosInstance | undefined;
  let accessToken: string | undefined;
  let expiresAt: number = 0;

  return async (): Promise<AxiosInstance> => {
    const expiryCutoff = Math.ceil(Date.now() / 1000) + tokenExpiryThreshold;
    const needsRefresh = Boolean(!accessToken || expiresAt <= expiryCutoff);
    if (needsRefresh || !instance) {
      try {
        ({ accessToken, expiresAt } = await getToken());
      } catch (e) {
        console.error('Error fetching token', e);
        throw e;
      }

      instance = axios.create({
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        ...getInstanceConfig(),
      });

      // This is here as an attempt to address intermittent 'socket hang up' errors
      // If we keep seeing them, we might consider removing it.
      axiosRetry(instance, {
        retries: 3,
        retryDelay: axiosRetry.exponentialDelay,
        onRetry: (_, error) => {
          console.warn(
            'Error occurred during request, retrying',
            error.message
          );
        },
      });
    }
    return instance;
  };
};

export const REGISTRATION_NAME_PREFIX = 'Auth0_Registration';

export const hasTempName = (firstName: string, lastName: string): boolean =>
  firstName.startsWith(REGISTRATION_NAME_PREFIX) ||
  lastName.startsWith(REGISTRATION_NAME_PREFIX);
