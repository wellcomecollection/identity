import { APIResponse } from '@weco/identity-common';
import { AppMetadata, Auth0User } from './auth0';

export default interface Auth0Client {
  validateUserCredentials(
    sourceIp: string,
    username: string,
    password: string
  ): Promise<APIResponse<{}>>;
  updatePassword(
    userId: number,
    password: string
  ): Promise<APIResponse<Auth0User>>;

  getUserByUserId(userId: number): Promise<APIResponse<Auth0User>>;

  deleteUser(userId: number): Promise<APIResponse<void>>;

  updateUser(userId: number, email: string): Promise<APIResponse<Auth0User>>;

  setAppMetadata(
    userId: number,
    metadata: AppMetadata
  ): Promise<APIResponse<{}>>;

  blockAccount(userId: number): Promise<APIResponse<{}>>;
}
