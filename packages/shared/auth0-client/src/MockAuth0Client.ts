import Auth0Client from './Auth0Client';
import { Auth0Profile, Auth0UserInfo } from './auth0';
import {
  APIResponse,
  errorResponse,
  ResponseStatus,
  successResponse,
} from '@weco/identity-common';

export default class MockAuth0Client implements Auth0Client {
  private users: Map<string, Auth0Profile> = new Map();
  private passwords: Map<string, string> = new Map();
  private accessTokens: Map<string, string> = new Map();

  reset = () => {
    this.users.clear();
    this.passwords.clear();
    this.accessTokens.clear();
  };

  addUser = (
    { userId, firstName, lastName, email, additionalAttributes }: Auth0UserInfo,
    password?: string
  ) => {
    const profile = {
      creationDate: new Date().toISOString(),
      lastLoginDate: null,
      lastLoginIp: null,
      locked: false,
      totalLogins: null,
      updatedDate: new Date().toISOString(),
      userId: userId,
      name: firstName + ' ' + lastName,
      firstName: firstName,
      lastName: lastName,
      email: email,
      emailValidated: false,
      metadata: additionalAttributes,
    };
    this.users.set(userId, profile);
    this.passwords.set(userId, password || '');
  };

  addAdminUser = (user: Auth0UserInfo, password?: string) =>
    this.addUser(
      {
        ...user,
        additionalAttributes: { ...user.additionalAttributes, is_admin: true },
      },
      password
    );

  getAccessToken = (userId: string) => {
    if (this.users.has(userId)) {
      const token = Math.floor(Math.random() * 10e10).toString();
      this.accessTokens.set(token, userId);
      return token;
    }
    throw new Error("User doesn't exist!");
  };

  blockAccount = jest.fn(async (userId) => {
    const maybeUser = this.users.get(userId);
    if (maybeUser) {
      this.users.set(userId, { ...maybeUser, locked: true });
      return successResponse({});
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  unblockAccount = jest.fn(async (userId) => {
    const maybeUser = this.users.get(userId);
    if (maybeUser) {
      this.users.set(userId, { ...maybeUser, locked: false });
      return successResponse({});
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  createUser = jest.fn(async (userId, firstName, lastName, email, password) => {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return errorResponse(
          'Already exists',
          ResponseStatus.UserAlreadyExists
        );
      }
    }
    const user: Auth0Profile = {
      creationDate: new Date().toISOString(),
      lastLoginDate: null,
      lastLoginIp: null,
      locked: false,
      totalLogins: null,
      updatedDate: new Date().toISOString(),
      userId: 'p' + userId,
      name: firstName + ' ' + lastName,
      firstName: firstName,
      lastName: lastName,
      email: email,
      emailValidated: false,
    };
    this.users.set(userId, user);
    this.passwords.set(userId, password);
    return successResponse(user);
  });

  deleteUser = jest.fn(async (userId) => {
    if (this.users.has(userId)) {
      this.users.delete(userId);
      return successResponse({});
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  getUserByEmail = jest.fn(async (email) => {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return successResponse(user);
      }
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  getUserByUserId = jest.fn(async (userId) => {
    const maybeUser = this.users.get(userId);
    if (maybeUser) {
      return successResponse(maybeUser);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  searchUsers = jest.fn(
    async (
      page: number,
      pageSize: number,
      sort: string,
      sortDir: number,
      name: string,
      email: string,
      status: string
    ) => {
      const emails = email.split(' ');
      const names = name.split(' ');
      const searchList = [];
      for (const user of this.users.values()) {
        if (
          emails.length !== 0 &&
          !emails.some((email) => user.email.includes(email))
        ) {
          continue;
        }
        if (
          names.length !== 0 &&
          !names.some((name) => user.name.includes(name))
        ) {
          continue;
        }
        if (status === 'active' && user.locked) {
          continue;
        }
        if (status === 'locked' && !user.locked) {
          continue;
        }
        if (status === 'deletePending' && !user.metadata?.deleteRequested) {
          continue;
        }
        searchList.push(user);
      }
      const sortKey = sort as keyof Auth0Profile;
      const sortedUsers = searchList
        .slice()
        .sort(
          (a, b) =>
            a[sortKey ?? 'userId']
              ?.toString()
              ?.localeCompare(b[sortKey ?? 'userId']?.toString() ?? '') ?? 0
        );
      if (sortDir === -1) {
        sortedUsers.reverse();
      }
      return successResponse({
        results: sortedUsers,
        pageSize: sortedUsers.length,
        totalResults: sortedUsers.length,
        pageCount: 1,
        sort,
        sortDir,
        page,
        name,
        email,
        status,
      });
    }
  );

  sendPasswordResetEmail = jest.fn().mockResolvedValue(successResponse({}));

  sendVerificationEmail = jest.fn().mockResolvedValue(successResponse({}));

  setAppMetadata = jest.fn(async (userId, metadata) => {
    const maybeUser = this.users.get(userId);
    if (maybeUser) {
      const updatedUser: Auth0Profile = {
        ...maybeUser,
        metadata,
      };
      this.users.set(userId, updatedUser);
      return successResponse(updatedUser);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  updatePassword = jest.fn(async (userId, password) => {
    const maybeUser = this.users.get(userId);
    if (maybeUser) {
      this.passwords.set(userId, password);
      return successResponse(maybeUser);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  updateUser = jest.fn(async (userId, email, firstName, lastName) => {
    const maybeUser = this.users.get(userId);
    if (maybeUser) {
      for (const user of this.users.values()) {
        if (user.email === 'email') {
          return errorResponse(
            'Already exists',
            ResponseStatus.UserAlreadyExists
          );
        }
      }
      const updatedUser: Auth0Profile = {
        ...maybeUser,
        name: firstName + ' ' + lastName,
        firstName,
        lastName,
        email,
      };
      this.users.set(userId, updatedUser);
      return successResponse(updatedUser);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  validateAccessToken = jest.fn(async (accessToken) => {
    const maybeUserId = this.accessTokens.get(accessToken);
    if (maybeUserId) {
      const user = this.users.get(maybeUserId)!;
      return successResponse({
        ...user,
        additionalAttributes: user.metadata,
      });
    }
    return errorResponse('Invalid token', ResponseStatus.InvalidCredentials);
  });

  validateUserCredentials = jest.fn(async (sourceIp, username, password) => {
    for (const user of this.users.values()) {
      if (
        user.email === 'username' &&
        this.passwords.get(user.userId) === password
      ) {
        return successResponse({});
      }
    }
    return errorResponse(
      'Invalid credentials',
      ResponseStatus.InvalidCredentials
    );
  });
}
