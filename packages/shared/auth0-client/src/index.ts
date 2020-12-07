import { APIResponse, errorResponse, ResponseStatus, successResponse, unhandledError } from '@weco/identity-common';
import axios, { AxiosInstance } from 'axios';
import { Auth0Profile, Auth0UserInfo, toAuth0UserId, toUserInfo, toUserProfile } from './auth0';
import {toPatronRecord} from "@weco/sierra-client/lib/patron";

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

  async validateAccessToken(accessToken: string): Promise<APIResponse<Auth0UserInfo>> {
    return this.getInstanceOnBehalfOf(accessToken).get('/userinfo', {
      validateStatus: status => status === 200
    }).then(response =>
      successResponse(toUserInfo(response))
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

  async getProfileByUserId(userId: string): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then(instance => {
      return instance.get('/users/' + toAuth0UserId(Number(userId)), {
        validateStatus: status => status === 200
      }).then(response =>
        successResponse(toUserProfile(response.data))
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

  async getProfileByEmail(email: string): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then(instance => {
      return instance.get('/users-by-email', {
        params: {
          email: email.toLowerCase()
        },
        validateStatus: status => status === 200
      }).then(response => {
        if (response.data.length === 0) {
          return errorResponse('Auth0 user with email [' + email + '] not found', ResponseStatus.NotFound);
        } else {
          return successResponse(toUserProfile(response.data[0]))
        }
      }).catch(error => {
        return unhandledError(error);
      });
    });
  }

  async createAccount(userId: number, email: string, password: string): Promise<APIResponse<Auth0Profile>> {
    return this.getMachineToMachineInstance().then(instance => {
      return instance.post('/users', {
        user_id: toAuth0UserId(userId),
        email: email,
        password: password,
        email_verified: false,
        verify_email: true,
        connection: 'Sierra-Connection'
      }, {
        validateStatus: status => status === 201
      }).then(response =>
        successResponse(toUserProfile(response.data))
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              return errorResponse('Malformed or invalid Auth0 user creation request', ResponseStatus.MalformedRequest, error);
            case 409:
              return errorResponse('AUth0 user with email [' + email + '] already exists', ResponseStatus.UserAlreadyExists, error);
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
