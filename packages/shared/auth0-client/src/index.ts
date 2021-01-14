import { APIResponse, errorResponse, ResponseStatus, successResponse, unhandledError } from '@weco/identity-common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Auth0Profile, Auth0UserInfo, toAuth0Profile, toAuth0UserInfo } from './auth0';

function responseCodeIs(responseCode: number) {
  return (status: number) => status === responseCode;
}

export default class Auth0Client {

  private readonly apiRoot: string;
  private readonly apiAudience: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(apiRoot: string, apiAudience: string, clientId: string, clientSecret: string) {
    this.apiRoot = apiRoot;
    this.apiAudience = apiAudience;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async deleteUser(userId: number): Promise<APIResponse<boolean>> {
    const httpClient = await this.getMachineToMachineInstance();

    return httpClient.delete(`/users/auth0|p${userId}`, { validateStatus: responseCodeIs(204), })
      .then(_ => {
        return successResponse(true);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          switch (error.response.status) {
            case 404:
              return errorResponse(`User with id "auth0|p${userId}" not found`, ResponseStatus.NotFound, error);
          }
        }

        return unhandledError(error);
      });
  }

  async validateAccessToken(accessToken: string): Promise<APIResponse<Auth0UserInfo>> {
    return this.getInstanceOnBehalfOf(accessToken).get('/userinfo', {
      validateStatus: status => status === 200
    }).then(response =>
      successResponse(toAuth0UserInfo(response.data))
    ).catch(error => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            return errorResponse('Auth0 access token [' + accessToken + '] not valid', ResponseStatus.InvalidCredentials, error);
        }
      }
      return unhandledError(error);
    });
  }

  async getUserByUserId(userId: number): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then(instance => {
      return instance.get('/users/auth0|p' + userId, { // Automatically append the mandatory Auth0 prefix to the given user ID.
        validateStatus: status => status === 200
      }).then(response =>
        successResponse(toAuth0Profile(response.data))
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 404:
              return errorResponse('Auth0 user with ID [' + userId + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async getUserByEmail(email: string): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then(instance => {
      return instance.get('/users-by-email', {
        params: {
          email: email.toLowerCase()
        },
        validateStatus: status => status === 200
      }).then(response => {
        // Even though email addresses are unique in Auth0, this endpoint will return a 200 and an empty JSON array if
        // there's no match. If there is a match, we still get the JSON array, with a single JSON object inside it.
        if (response.data.length === 0) {
          return errorResponse('Auth0 user with email [' + email + '] not found', ResponseStatus.NotFound);
        } else {
          return successResponse(toAuth0Profile(response.data[0]))
        }
      }).catch(error => {
        return unhandledError(error);
      });
    });
  }

  async createUser(userId: number, email: string, password: string): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then(instance => {
      return instance.post('/users', {
        user_id: 'p' + userId, // When creating an Auth0 user, don't provide the 'auth0|' prefix, just prefix the 'p' - Auth0 will do the rest.
        name: email, // Auth0 defaults this to the email address, but we'll provide it here anyway for consistency
        email: email,
        password: password,
        email_verified: false,
        connection: 'Sierra-Connection'
      }, {
        validateStatus: status => status === 201
      }).then(response =>
        successResponse(toAuth0Profile(response.data))
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 400: {
              if (error.response.data?.message?.startsWith('PasswordStrengthError')) {
                return errorResponse('Password does not meet Auth0 policy', ResponseStatus.PasswordTooWeak, error);
              } else {
                return errorResponse('Malformed or invalid Auth0 user creation request', ResponseStatus.MalformedRequest, error);
              }
            }
            case 409:
              return errorResponse('AUth0 user with email [' + email + '] already exists', ResponseStatus.UserAlreadyExists, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async updateUser(userId: number, email: string): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then(instance => {
      return instance.patch('/users/auth0|p' + userId, { // Automatically append the mandatory Auth0 prefix to the given user ID.
        name: email, // Auth0 defaults this to the email address, but we'll provide it here anyway for consistency
        email: email,
        verify_email: true,
        connection: 'Sierra-Connection'
      }, {
        validateStatus: status => status === 200
      }).then(response =>
        successResponse(toAuth0Profile(response.data))
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 400: {
              // Unlike '[POST] /users' which returns a 409 when the email address is already in use,
              // '[PATCH] /users/:user_id' returns a 400, so we have to test the content of the error message...
              if (error.response.data?.message?.startsWith('The specified new email already exists')) {
                return errorResponse('Auth0 user with email [' + email + '] already exists', ResponseStatus.UserAlreadyExists, error);
              } else {
                return errorResponse('Malformed or invalid Auth0 user update request', ResponseStatus.MalformedRequest, error);
              }
            }
            case 404:
              return errorResponse('Auth0 user with ID [' + userId + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async updatePassword(userId: number, password: string): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then(instance => {
      return instance.patch('/users/auth0|p' + userId, {
        password: password,
        connection: 'Sierra-Connection'
      }, {
        validateStatus: status => status === 200
      }).then(response =>
        successResponse(toAuth0Profile(response.data))
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 400: {
              if (error.response.data?.message?.startsWith('PasswordStrengthError')) {
                return errorResponse('Password does not meet Auth0 policy', ResponseStatus.PasswordTooWeak, error);
              } else {
                return errorResponse('Malformed or invalid Auth0 user creation request', ResponseStatus.MalformedRequest, error);
              }
            }
            case 404:
              return errorResponse('Auth0 user with ID [' + userId + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  private async getMachineToMachineInstance(): Promise<AxiosInstance> {
    return axios.post(this.apiRoot + '/oauth/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      audience: this.apiAudience,
      grant_type: 'client_credentials'
    }, {
      validateStatus: status => status === 200
    }).then(response => {
      return axios.create({
        baseURL: this.apiRoot + '/api/v2',
        headers: {
          Authorization: 'Bearer ' + response.data.access_token
        }
      });
    });
  }

  private getInstanceOnBehalfOf(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: this.apiRoot,
      headers: {
        Authorization: 'Bearer ' + accessToken
      },
    });
  }
}
