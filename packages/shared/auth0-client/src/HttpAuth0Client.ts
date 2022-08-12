import axios from 'axios';
import jwt from 'jsonwebtoken';
import {
  APIResponse,
  authenticatedInstanceFactory,
  errorResponse,
  responseCodeIs,
  ResponseStatus,
  successResponse,
  unhandledError,
} from '@weco/identity-common';
import { Auth0User, SierraConnection, SierraUserIdPrefix } from './auth0';
import Auth0Client, { Auth0UserInput } from './Auth0Client';

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

  async deleteUser(userId: number): Promise<APIResponse<void>> {
    try {
      const instance = await this.getMachineToMachineInstance();
      await instance.delete(`/users/${SierraUserIdPrefix + userId}`, {
        // If the user doesn't exist, the API will still return a 204
        validateStatus: (status) => status === 204,
      });
      return successResponse(undefined);
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 403:
            return errorResponse(
              'Client has insufficient scope to delete users',
              ResponseStatus.InvalidCredentials
            );
          case 429:
            return errorResponse(
              'User deletion was rate limited',
              ResponseStatus.RateLimited
            );
        }
      }
      return unhandledError(error);
    }
  }

  async updateUser(userInput: Auth0UserInput): Promise<APIResponse<Auth0User>> {
    const { firstName, lastName, email, userId } = userInput;
    return this.getMachineToMachineInstance().then((instance) => {
      const names =
        firstName && lastName
          ? {
              given_name: firstName,
              family_name: lastName,
              name: `${firstName} ${lastName}`,
            }
          : {};
      // We only need to update the email value if it is provided, this allows us to update first and lastname without needing an email too
      const updateData = email
        ? { email: email, verify_email: true, connection: SierraConnection }
        : { connection: SierraConnection, ...names };
      return instance
        .patch('/users/' + SierraUserIdPrefix + userId, updateData, {
          validateStatus: (status) => status === 200,
        })
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
                } else if (
                  error.response.data?.message?.code === 136 &&
                  error.responses.data?.message?.description.startsWith(
                    'PIN is not valid : PIN is trivial'
                  )
                ) {
                  return errorResponse(
                    'Password contains repeated characters',
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

  async resendVerificationEmail(userId: number): Promise<APIResponse<void>> {
    try {
      const instance = await this.getMachineToMachineInstance();

      // https://auth0.com/docs/api/management/v2#!/Jobs/post_verification_email
      await instance.post(
        '/jobs/verification-email',
        { user_id: userId },
        {
          validateStatus: (status) => status === 201,
        }
      );
      return successResponse(undefined);
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 403:
            return errorResponse(
              'Client has insufficient scope to resend verification emails',
              ResponseStatus.InvalidCredentials
            );
          case 429:
            return errorResponse(
              'Resending verification email was rate limited',
              ResponseStatus.RateLimited
            );
        }
      }
      return unhandledError(error);
    }
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

  private getMachineToMachineInstance = authenticatedInstanceFactory(
    async () => {
      const response = await axios.post(
        this.apiRoot + '/oauth/token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: this.apiAudience,
          grant_type: 'client_credentials',
        },
        {
          validateStatus: responseCodeIs(200),
        }
      );

      const accessToken = response.data.access_token;
      const decodedToken = jwt.decode(accessToken);
      if (
        decodedToken &&
        typeof decodedToken === 'object' &&
        decodedToken.exp
      ) {
        return { accessToken, expiresAt: decodedToken.exp };
      } else {
        throw new Error("Can't extract expiry claim from token");
      }
    },
    () => ({
      baseURL: `${this.apiRoot}/api/v2`,
      timeout: 10 * 1000, // 10 seconds
    })
  );

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
