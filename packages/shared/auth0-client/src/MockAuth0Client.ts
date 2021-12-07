import Auth0Client from './Auth0Client';
import { Auth0Profile, Auth0UserInfo } from './auth0';
import {
  errorResponse,
  ResponseStatus,
  successResponse,
} from '@weco/identity-common';

// The Auth0 client gets called with numeric IDs but then stores/returns them as strings
// This is a bit of a pain but here we are, it's the easiest way to fix it.
type NumericIDAuth0UserInfo = Omit<Auth0UserInfo, 'userId'> & {
  userId: string | number;
};

export default class MockAuth0Client implements Auth0Client {
  private users: Map<string, Auth0Profile> = new Map();
  private passwords: Map<string, string> = new Map();
  private accessTokens: Map<string, string> = new Map();

  contains = (userId: number) => this.users.has(userId.toString());
  get = (userId: number) => this.users.get(userId.toString());
  markVerified = (userId: number) => {
    const maybeUser = this.users.get(userId.toString());
    if (maybeUser) {
      this.users.set(maybeUser.userId, {
        ...maybeUser,
        emailValidated: true,
      });
    }
  };

  reset = () => {
    this.users.clear();
    this.passwords.clear();
    this.accessTokens.clear();
  };

  addUser = (
    {
      userId,
      firstName,
      lastName,
      email,
      additionalAttributes,
    }: NumericIDAuth0UserInfo,
    password?: string
  ) => {
    const profile = {
      creationDate: new Date().toISOString(),
      lastLoginDate: null,
      lastLoginIp: null,
      locked: false,
      totalLogins: null,
      updatedDate: new Date().toISOString(),
      userId: userId.toString(),
      name: firstName + ' ' + lastName,
      firstName: firstName,
      lastName: lastName,
      email: email,
      emailValidated: false,
      metadata: additionalAttributes,
    };
    this.users.set(userId.toString(), profile);
    this.passwords.set(userId.toString(), password || '');
  };

  getAccessToken = (userId: number) => {
    if (this.users.has(userId.toString())) {
      const token = Math.floor(Math.random() * 10e10).toString();
      this.accessTokens.set(token, userId.toString());
      return token;
    }
    throw new Error("User doesn't exist!");
  };

  blockAccount = jest.fn(async (userId: number) => {
    const maybeUser = this.users.get(userId.toString());
    if (maybeUser) {
      this.users.set(userId.toString(), { ...maybeUser, locked: true });
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

  setAppMetadata = jest.fn(
    async (userId: number, metadata: Record<string, string>) => {
      const maybeUser = this.users.get(userId.toString());
      if (maybeUser) {
        const updatedUser: Auth0Profile = {
          ...maybeUser,
          metadata,
        };
        this.users.set(userId.toString(), updatedUser);
        return successResponse(updatedUser);
      }
      return errorResponse('Not found', ResponseStatus.NotFound);
    }
  );

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
      const updatedUser: Auth0Profile = {
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
          this.passwords.get(user.userId) === password
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
