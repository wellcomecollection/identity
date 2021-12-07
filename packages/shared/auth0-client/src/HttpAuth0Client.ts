import axios, { AxiosInstance } from 'axios';
import {
  APIResponse,
  errorResponse,
  responseCodeIs,
  ResponseStatus,
  successResponse,
  unhandledError,
} from '@weco/identity-common';
import { SierraConnection, SierraUserIdPrefix } from './auth0';
import Auth0Client, { Auth0User } from './Auth0Client';

export default class HttpAuth0Client implements Auth0Client {
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

  async getUserByUserId(userId: number): Promise<APIResponse<Auth0User>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .get('/users/' + SierraUserIdPrefix + userId, {
          // Automatically append the mandatory Auth0 prefix to the given user ID.
          validateStatus: (status) => status === 200,
        })
        .then((response) => successResponse(response.data))
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

  // @TODO This call should only handle users that exist in the Sierra connection
  async validateUserCredentials(
    sourceIp: string,
    username: string,
    password: string
  ): Promise<APIResponse<{}>> {
    return this.validateCredentials(sourceIp, username, password)
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
    email: string
  ): Promise<APIResponse<Auth0User>> {
    return this.getMachineToMachineInstance().then((instance) => {
      return instance
        .patch(
          '/users/' + SierraUserIdPrefix + userId,
          {
            // Automatically append the mandatory Auth0 prefix to the given user ID.
            email: email,
            verify_email: true,
            connection: SierraConnection,
          },
          {
            validateStatus: (status) => status === 200,
          }
        )
        .then((response) => successResponse(response.data))
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
                    'User with email [' + email + '] already exists',
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
  ): Promise<APIResponse<Auth0User>> {
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
        .then((response) => successResponse(response.data))
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
            validateStatus: responseCodeIs(200),
          }
        )
        .then((response) => successResponse(response.data))
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

  private validateCredentials(
    sourceIp: string,
    username: string,
    password: string
  ): Promise<boolean> {
    return axios.post(
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
    );
  }
}
