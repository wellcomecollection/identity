import axios, { AxiosInstance } from 'axios';
import {
  APIResponse,
  errorResponse,
  responseCodeIs,
  ResponseStatus,
  successResponse,
  unhandledError,
} from '@weco/identity-common';
import {
  Auth0Profile,
  Auth0SearchResults,
  Auth0SearchSortFields,
  Auth0UserInfo,
  generateUserSearchQuery,
  SierraConnection,
  SierraUserIdPrefix,
  toAuth0Profile,
  toAuth0SearchResults,
  toAuth0UserInfo,
} from './auth0';

export default class Auth0Client {
  private readonly apiRoot: string;
  private readonly apiAudience: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    apiRoot: string,
    apiAudience: string,
    clientId: string,
    clientSecret: string
  ) {
    this.apiRoot = apiRoot;
    this.apiAudience = apiAudience;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  // This call intentionally handles access tokens pertaining to any connection. Without this, we wouldn't be able to
  // test and verify access tokens issued by the Azure AD connection on behalf of administrator users.
  async validateAccessToken(
    accessToken: string
  ): Promise<APIResponse<Auth0UserInfo>> {
    return this.getInstanceOnBehalfOf(accessToken)
      .get('/userinfo', {
        validateStatus: (status) => status === 200,
      })
      .then((response) => successResponse(toAuth0UserInfo(response.data)))
      .catch((error) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              return errorResponse(
                'Auth0 access token [' + accessToken + '] not valid',
                ResponseStatus.InvalidCredentials,
                error
              );
          }
        }
        return unhandledError(error);
      });
  }

  async getUserByUserId(userId: number): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .get('/users/' + SierraUserIdPrefix + userId, {
          // Automatically append the mandatory Auth0 prefix to the given user ID.
          validateStatus: (status) => status === 200,
        })
        .then((response) => successResponse(toAuth0Profile(response.data)))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 404:
                return errorResponse(
                  'Auth0 user with ID [' + userId + '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  // @TODO This call should only search users that exist in the Sierra connection
  async getUserByEmail(email: string): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .get('/users-by-email', {
          params: {
            email: email.toLowerCase(),
          },
          validateStatus: (status) => status === 200,
        })
        .then((response) => {
          // Even though email addresses are unique in Auth0, this endpoint will return a 200 and an empty JSON array if
          // there's no match. If there is a match, we still get the JSON array, with a single JSON object inside it.
          if (response.data.length === 0) {
            return errorResponse(
              'Auth0 user with email [' + email + '] not found',
              ResponseStatus.NotFound
            );
          } else {
            return successResponse(toAuth0Profile(response.data[0]));
          }
        })
        .catch((error) => {
          return unhandledError(error);
        });
    });
  }

  async createUser(
    userId: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .post(
          '/users',
          {
            user_id: 'p' + userId, // When creating an Auth0 user, don't provide the 'auth0|' prefix, just prefix the 'p' - Auth0 will do the rest.
            name: firstName + ' ' + lastName,
            given_name: firstName,
            family_name: lastName,
            email: email,
            password: password,
            email_verified: false,
            connection: SierraConnection,
          },
          {
            validateStatus: (status) => status === 201,
          }
        )
        .then((response) => successResponse(toAuth0Profile(response.data)))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400: {
                if (
                  error.response.data?.message?.startsWith(
                    'PasswordStrengthError'
                  )
                ) {
                  return errorResponse(
                    'Password does not meet Auth0 policy',
                    ResponseStatus.PasswordTooWeak,
                    error
                  );
                } else if (
                  error.response.data?.message.startsWith(
                    'PasswordDictionaryError'
                  )
                ) {
                  return errorResponse(
                    'Password is too common or has been explicitly forbidden',
                    ResponseStatus.PasswordTooWeak,
                    error
                  );
                } else {
                  return errorResponse(
                    'Malformed or invalid Auth0 user creation request',
                    ResponseStatus.MalformedRequest,
                    error
                  );
                }
              }
              case 409:
                return errorResponse(
                  'AUth0 user with email [' + email + '] already exists',
                  ResponseStatus.UserAlreadyExists,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  // @TODO This call should only handle users that exist in the Sierra connection
  async validateUserCredentials(
    sourceIp: string,
    username: string,
    password: string
  ): Promise<APIResponse<{}>> {
    return this.getInstanceWithCredentials(sourceIp, username, password)
      .then(() => successResponse(true))
      .catch((error) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
            case 403: {
              return errorResponse(
                'Invalid credentials',
                ResponseStatus.InvalidCredentials,
                error
              );
            }
            case 429: {
              return errorResponse(
                'Too many unsuccessful login requests, brute force protection is enabled',
                ResponseStatus.RateLimited,
                error
              );
            }
          }
        }
        return unhandledError(error);
      });
  }

  async updateUser(
    userId: number,
    email: string,
    firstName: string,
    lastName: string
  ): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .patch(
          '/users/' + SierraUserIdPrefix + userId,
          {
            // Automatically append the mandatory Auth0 prefix to the given user ID.
            email: email,
            given_name: firstName,
            family_name: lastName,
            name: firstName + ' ' + lastName,
            verify_email: true,
            connection: SierraConnection,
          },
          {
            validateStatus: (status) => status === 200,
          }
        )
        .then((response) => successResponse(toAuth0Profile(response.data)))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400: {
                // Unlike '[POST] /users' which returns a 409 when the email address is already in use,
                // '[PATCH] /users/:user_id' returns a 400, so we have to test the content of the error message...
                if (
                  error.response.data?.message?.startsWith(
                    'The specified new email already exists'
                  )
                ) {
                  return errorResponse(
                    'Auth0 user with email [' + email + '] already exists',
                    ResponseStatus.UserAlreadyExists,
                    error
                  );
                } else {
                  return errorResponse(
                    'Malformed or invalid Auth0 user update request',
                    ResponseStatus.MalformedRequest,
                    error
                  );
                }
              }
              case 404:
                return errorResponse(
                  'Auth0 user with ID [' + userId + '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  async updatePassword(
    userId: number,
    password: string
  ): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .patch(
          '/users/' + SierraUserIdPrefix + userId,
          {
            password: password,
            connection: SierraConnection,
          },
          {
            validateStatus: (status) => status === 200,
          }
        )
        .then((response) => successResponse(toAuth0Profile(response.data)))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400: {
                if (
                  error.response.data?.message?.startsWith(
                    'PasswordStrengthError'
                  )
                ) {
                  return errorResponse(
                    'Password does not meet Auth0 policy',
                    ResponseStatus.PasswordTooWeak,
                    error
                  );
                } else if (
                  error.response.data?.message.startsWith(
                    'PasswordDictionaryError'
                  )
                ) {
                  return errorResponse(
                    'Password is too common or has been explicitly forbidden',
                    ResponseStatus.PasswordTooWeak,
                    error
                  );
                } else {
                  return errorResponse(
                    'Malformed or invalid Auth0 user creation request',
                    ResponseStatus.MalformedRequest,
                    error
                  );
                }
              }
              case 404:
                return errorResponse(
                  'Auth0 user with ID [' + userId + '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  async searchUsers(
    page: number,
    pageSize: number,
    sort: string,
    sortDir: number,
    name: string | undefined,
    email: string | undefined,
    status: string | undefined
  ): Promise<APIResponse<Auth0SearchResults>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .get('/users', {
          params: {
            page: page,
            per_page: pageSize,
            include_totals: true,
            sort: Auth0SearchSortFields.get(sort) + ':' + sortDir,
            q: generateUserSearchQuery(name, email, status),
            search_engine: 'v3',
          },
          validateStatus: (status) => status === 200,
        })
        .then((response) =>
          successResponse(
            toAuth0SearchResults(
              page,
              sort,
              sortDir,
              name,
              email,
              status,
              response.data
            )
          )
        )
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400: {
                return errorResponse(
                  'Malformed or invalid Auth0 user search request',
                  ResponseStatus.MalformedRequest,
                  error
                );
              }
              case 503: {
                return errorResponse(
                  'Auth0 user search query exceeded the timeout',
                  ResponseStatus.QueryTimeout,
                  error
                );
              }
            }
          }
          return unhandledError(error);
        });
    });
  }

  // @TODO This call should only handle users that exist in the Sierra connection - not sure if this is possible?
  async sendVerificationEmail(userId: number): Promise<APIResponse<{}>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .post(
          '/jobs/verification-email',
          {
            user_id: SierraUserIdPrefix + userId,
          },
          {
            validateStatus: (status) => status === 201,
          }
        )
        .then(() => successResponse({}))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400: {
                return errorResponse(
                  'Malformed or invalid Auth0 email verification request',
                  ResponseStatus.MalformedRequest,
                  error
                );
              }
            }
          }
          return unhandledError(error);
        });
    });
  }

  async sendPasswordResetEmail(email: string): Promise<APIResponse<{}>> {
    return axios
      .post(
        this.apiRoot + '/dbconnections/change_password',
        {
          email: email,
          connection: SierraConnection,
        },
        {
          validateStatus: (status) => status === 200,
        }
      )
      .then(() => successResponse({}))
      .catch((error) => {
        if (error.response) {
          switch (error.response.status) {
            case 400: {
              return errorResponse(
                'Malformed or invalid Auth0 password reset request',
                ResponseStatus.MalformedRequest,
                error
              );
            }
          }
        }
        return unhandledError(error);
      });
  }

  async setAppMetadata(
    userId: number,
    metadata: Record<string, any>
  ): Promise<APIResponse<{}>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .patch(
          '/users/' + SierraUserIdPrefix + userId,
          {
            app_metadata: metadata,
          },
          {
            validateStatus: (status) => status === 200,
          }
        )
        .then((response) => successResponse(toAuth0Profile(response.data)))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400: {
                return errorResponse(
                  'Malformed or invalid Auth0 user app metadata update request',
                  ResponseStatus.MalformedRequest,
                  error
                );
              }
              case 404:
                return errorResponse(
                  'Auth0 user with ID [' + userId + '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  async blockAccount(userId: number): Promise<APIResponse<{}>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .patch(
          '/users/' + SierraUserIdPrefix + userId,
          {
            blocked: true,
          },
          {
            validateStatus: (status) => status === 200,
          }
        )
        .then(() => successResponse({}))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400: {
                return errorResponse(
                  'Malformed or invalid Auth0 user block request',
                  ResponseStatus.MalformedRequest,
                  error
                );
              }
              case 404:
                return errorResponse(
                  'Auth0 user with ID [' + userId + '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  async unblockAccount(userId: number): Promise<APIResponse<{}>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .patch(
          '/users/' + SierraUserIdPrefix + userId,
          {
            blocked: false,
          },
          {
            validateStatus: (status) => status === 200,
          }
        )
        .then(() => successResponse({}))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400: {
                return errorResponse(
                  'Malformed or invalid Auth0 user unblock request',
                  ResponseStatus.MalformedRequest,
                  error
                );
              }
              case 404:
                return errorResponse(
                  'Auth0 user with ID [' + userId + '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  async deleteUser(userId: number): Promise<APIResponse<{}>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .delete('/users/' + SierraUserIdPrefix + userId, {
          validateStatus: responseCodeIs(204),
        })
        .then(() => {
          return successResponse({});
        })
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 404:
                return errorResponse(
                  'Auth0 user with ID [' + userId + '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  private async getMachineToMachineInstance(): Promise<AxiosInstance> {
    return axios
      .post(
        this.apiRoot + '/oauth/token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: this.apiAudience,
          grant_type: 'client_credentials',
        },
        {
          validateStatus: (status) => status === 200,
        }
      )
      .then((response) => {
        return axios.create({
          baseURL: this.apiRoot + '/api/v2',
          headers: {
            Authorization: 'Bearer ' + response.data.access_token,
          },
        });
      });
  }

  private getInstanceWithCredentials(
    sourceIp: string,
    username: string,
    password: string
  ): Promise<AxiosInstance> {
    return axios
      .post(
        this.apiRoot + '/oauth/token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: this.apiAudience,
          grant_type: 'password',
          username: username,
          password: password,
        },
        {
          headers: {
            'Auth0-Forwarded-For': sourceIp,
          },
          validateStatus: responseCodeIs(200),
        }
      )
      .then((response) => {
        return axios.create({
          baseURL: this.apiRoot + '/api/v2',
          headers: {
            Authorization: 'Bearer ' + response.data.access_token,
          },
        });
      });
  }

  private getInstanceOnBehalfOf(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: this.apiRoot,
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });
  }
}
