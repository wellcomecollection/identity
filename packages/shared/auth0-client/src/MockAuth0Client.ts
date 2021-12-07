import Auth0Client, { Auth0User } from './Auth0Client';
import {
  errorResponse,
  ResponseStatus,
  successResponse,
} from '@weco/identity-common';
import { AppMetadata } from './auth0';

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
    this.users.set(user.user_id!, user);
    this.passwords.set(user.user_id!.toString(), password || '');
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

  updateUser = jest.fn(async (userId: number, email: string) => {
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
  });

  validateUserCredentials = jest.fn(
    async (sourceIp: string, username: string, password: string) => {
      for (const user of this.users.values()) {
        if (
          user.email === username &&
          this.passwords.get(user.user_id || '') === password
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
