import Auth0Client, { Auth0UserInput } from './Auth0Client';
import {
  APIResponse,
  errorResponse,
  ResponseStatus,
  successResponse,
} from '@weco/identity-common';
import { AppMetadata, auth0IdToPublic, Auth0User } from './auth0';

export default class MockAuth0Client implements Auth0Client {
  private users: Map<string, Auth0User> = new Map();
  private passwords: Map<string, string> = new Map();
  private accessTokens: Map<string, string> = new Map();

  contains = (userId: number) => this.users.has(userId.toString());
  get = (userId: number) => this.users.get(userId.toString());
  markVerified = (userId: number) => {
    const maybeUser = this.users.get(userId.toString());
    if (maybeUser?.user_id) {
      this.users.set(maybeUser.user_id, {
        ...maybeUser,
        email_verified: true,
      });
    }
  };

  reset = () => {
    this.users.clear();
    this.passwords.clear();
    this.accessTokens.clear();
  };

  addUser = (user: Auth0User, password?: string) => {
    this.users.set(user.user_id, {
      ...user,
      user_id: 'auth0|p' + user.user_id,
    });
    this.passwords.set(user.user_id.toString(), password || '');
  };

  blockAccount = jest.fn(async (userId: number) => {
    const maybeUser = this.users.get(userId.toString());
    if (maybeUser) {
      this.users.set(userId.toString(), { ...maybeUser, blocked: true });
      return successResponse({});
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  getUserByUserId = jest.fn(async (userId: number) => {
    const maybeUser = this.users.get(userId.toString());
    if (maybeUser) {
      return successResponse(maybeUser);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  deleteUser = jest.fn(async (userId: number): Promise<APIResponse<void>> => {
    this.users.delete(userId.toString());
    this.passwords.delete(userId.toString());
    this.accessTokens.delete(userId.toString());
    return successResponse(undefined);
  });

  setAppMetadata = jest.fn(async (userId: number, metadata: AppMetadata) => {
    const maybeUser = this.users.get(userId.toString());
    if (maybeUser) {
      const updatedUser: Auth0User = {
        ...maybeUser,
        app_metadata: metadata,
      };
      this.users.set(userId.toString(), updatedUser);
      return successResponse(updatedUser);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  updatePassword = jest.fn(async (userId: number, password: string) => {
    const maybeUser = this.users.get(userId.toString());
    if (maybeUser) {
      this.passwords.set(userId.toString(), password);
      return successResponse(maybeUser);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  updateUser = jest.fn(async (userInput: Auth0UserInput) => {
    const { userId, email, firstName, lastName } = userInput;
    if (email) {
      const maybeUser = this.users.get(userId.toString());
      if (maybeUser) {
        for (const user of this.users.values()) {
          if (user.email === email) {
            return errorResponse(
              'Already exists',
              ResponseStatus.UserAlreadyExists
            );
          }
        }
        const updatedUser: Auth0User = {
          ...maybeUser,
          email,
        };
        this.users.set(userId.toString(), updatedUser);
        return successResponse(updatedUser);
      }
      return errorResponse('Not found', ResponseStatus.NotFound);
    } else {
      const maybeUser = this.users.get(userId.toString());
      const names =
        firstName && lastName
          ? {
              given_name: firstName,
              family_name: lastName,
              name: `${firstName} ${lastName}`,
            }
          : {};
      if (maybeUser) {
        const updatedUser: Auth0User = {
          ...maybeUser,
          ...names,
        };
        this.users.set(userId.toString(), updatedUser);
        return successResponse(updatedUser);
      }
      return errorResponse('Not found', ResponseStatus.NotFound);
    }
  });

  sendVerificationEmail = jest.fn(async (userId: number) => {
    if (this.users.has(userId.toString())) {
      return successResponse(undefined);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  validateUserCredentials = jest.fn(
    async (sourceIp: string, username: string, password: string) => {
      for (const user of this.users.values()) {
        if (
          user.email === username &&
          this.passwords.get(auth0IdToPublic(user.user_id) || '') === password
        ) {
          return successResponse({});
        }
      }
      return errorResponse(
        'Invalid credentials',
        ResponseStatus.InvalidCredentials
      );
    }
  );
}
