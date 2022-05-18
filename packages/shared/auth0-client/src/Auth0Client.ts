import { APIResponse } from '@weco/identity-common';
import { AppMetadata, Auth0User } from './auth0';

export type Auth0UserInput = {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
};

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

  updateUser(userInput: Auth0UserInput): Promise<APIResponse<Auth0User>>;

  setAppMetadata(
    userId: number,
    metadata: AppMetadata
  ): Promise<APIResponse<{}>>;

  blockAccount(userId: number): Promise<APIResponse<{}>>;
}
