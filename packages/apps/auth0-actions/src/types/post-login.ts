import { User } from 'auth0';
import { Url } from 'url';

// https://auth0.com/docs/actions/triggers/post-login/event-object
export type Event<UserType extends User = User> = {
  authentication?: EventAuthentication;
  authorization?: EventAuthorization;
  client: EventClient;
  connection: EventConnection;
  organization?: EventOrganization;
  request: EventRequest;
  resource_server?: EventResourceServer;
  stats: EventStats;
  tenant: EventTenant;
  transaction?: EventTransaction;
  user: UserType;
  secrets: EventSecrets;
};

export type AuthenticationMethodName =
  | 'federated'
  | 'pwd'
  | 'sms'
  | 'email'
  | 'mfa'
  | 'mock';

export type AuthenticationMethod = {
  name: AuthenticationMethodName;
  timestamp: string;
};

export type EventAuthentication = {
  methods: AuthenticationMethod[];
};

export type EventAuthorization = {
  roles: string[];
};

export type EventClient = {
  client_id: string;
  metadata: Record<string, string>;
  name: string;
};

export type EventConnection = {
  id: string;
  metadata?: Record<string, string>;
  name: string;
  strategy: string;
};

export type EventOrganization = {
  display_name: string;
  id: string;
  metadata: Record<string, string>;
  name: string;
};

export type GeoIP = {
  cityName?: string;
  continentCode?: string;
  countryCode?: string;
  countryCode3?: string;
  countryName?: string;
  latitude?: number;
  longitude?: number;
  timeZone?: string;
};

export type EventRequest = {
  body: Record<string, string>;
  geoip: GeoIP;
  hostname?: string;
  ip: string;
  language?: string;
  method: string;
  query: Record<string, string>;
  user_agent?: string;
};

export type EventResourceServer = {
  identifier: string;
};

export type EventStats = {
  logins_count: number;
};

export type EventSecrets = {
  AUTH0_ACTION_SECRET: string;
};

export type EventTenant = {
  id: string;
};

export type EventTransactionProtocol =
  | 'oidc-basic-profile'
  | 'oidc-implicit-profile'
  | 'oauth2-device-code'
  | 'oauth2-resource-owner'
  | 'oauth2-resource-owner-jwt-bearer'
  | 'oauth2-password'
  | 'oauth2-access-token'
  | 'oauth2-refresh-token'
  | 'oauth2-token-exchange'
  | 'oidc-hybrid-profile'
  | 'samlp'
  | 'wsfed'
  | 'wstrust-usernamemixed';

export type EventTransaction = {
  acr_values: string[];
  locale: string;
  protocol?: EventTransactionProtocol;
  requested_scopes: string[];
  ui_locales: string[];
};

// https://auth0.com/docs/actions/triggers/post-login/api-object
export type API<UserType extends User = User> = {
  access: APIAccess<UserType>;
  accessToken: APIAccessToken<UserType>;
  idToken: APIIdToken<UserType>;
  multifactor: APIMultifactor<UserType>;
  user: APIUser<UserType>;
  redirect: APIRedirect<UserType>;
};

export type APIAccess<UserType extends User = User> = {
  deny: (reason: string) => API<UserType>;
};

export type APIAccessToken<UserType extends User = User> = {
  setCustomClaim: <T>(name: string, value: T) => API<UserType>;
};

export type APIIdToken<UserType extends User = User> = {
  setCustomClaim: <T>(name: string, value: T) => API<UserType>;
};

export type APIRedirect<UserType extends User = User> = {
  sendUserTo: <SendUserObject>(SendUserObject: SendUserObject) => API<UserType>;
  encodeToken: <EncodeToken>(EncodeToken: EncodeToken) => API<UserType>;
  validateToken: <ValidateToken>(ValidateToken: ValidateToken) => API<UserType>;
};

export type SendUserObject = {
  url: Url;
  query: object;
};

export type ValidateToken = {
  secret: string;
};

export type EncodeToken = {
  secret: string;
  payload: object;
};

export type APIMultifactorProvider =
  | 'any'
  | 'duo'
  | 'google-authenticator'
  | 'guardian';

export type APIMultifactorOptions = {
  allRememberBrowser?: boolean;
};

export type APIMultifactor<UserType extends User = User> = {
  enable: (
    provider: APIMultifactorProvider,
    options?: APIMultifactorOptions
  ) => API<UserType>;
};

export type APIUser<UserType extends User = User> = {
  setUserMetadata: <K extends keyof UserType['user_metadata']>(
    name: K,
    value: UserType['user_metadata'][K] | null
  ) => API<UserType>;
  setAppMetadata: <K extends keyof UserType['app_metadata']>(
    name: K,
    value: UserType['app_metadata'][K] | null
  ) => API<UserType>;
};
