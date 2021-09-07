import { APIResponse } from '@weco/identity-common';
import { Auth0Profile, Auth0SearchResults, Auth0UserInfo } from './auth0';

export default interface Auth0Client {
  validateAccessToken(accessToken: string): Promise<APIResponse<Auth0UserInfo>>;
  validateUserCredentials(
    sourceIp: string,
    username: string,
    password: string
  ): Promise<APIResponse<{}>>;
  updatePassword(
    userId: number,
    password: string
  ): Promise<APIResponse<Auth0Profile>>;

  getUserByUserId(userId: number): Promise<APIResponse<Auth0Profile>>;
  getUserByEmail(email: string): Promise<APIResponse<Auth0Profile>>;
  searchUsers(
    page: number,
    pageSize: number,
    sort: string,
    sortDir: number,
    name: string | undefined,
    email: string | undefined,
    status: string | undefined
  ): Promise<APIResponse<Auth0SearchResults>>;

  createUser(
    userId: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<APIResponse<Auth0Profile>>;
  updateUser(
    userId: number,
    email: string,
    firstName: string,
    lastName: string
  ): Promise<APIResponse<Auth0Profile>>;
  deleteUser(userId: number): Promise<APIResponse<{}>>;

  sendVerificationEmail(userId: number): Promise<APIResponse<{}>>;
  sendPasswordResetEmail(email: string): Promise<APIResponse<{}>>;

  setAppMetadata(
    userId: number,
    metadata: Record<string, any>
  ): Promise<APIResponse<{}>>;

  blockAccount(userId: number): Promise<APIResponse<{}>>;
  unblockAccount(userId: number): Promise<APIResponse<{}>>;
}
