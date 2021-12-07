import { APIResponse } from '@weco/identity-common';
import { Auth0Profile, Auth0SearchResults, Auth0UserInfo } from './auth0';

export default interface Auth0Client {
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

  updateUser(userId: number, email: string): Promise<APIResponse<Auth0Profile>>;

  setAppMetadata(
    userId: number,
    metadata: Record<string, any>
  ): Promise<APIResponse<{}>>;

  blockAccount(userId: number): Promise<APIResponse<{}>>;
}
