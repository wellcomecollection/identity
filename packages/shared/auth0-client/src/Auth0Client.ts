import { APIResponse } from '@weco/identity-common';
import { User } from 'auth0';
import { AppMetadata, UserMetadata } from './auth0';

export type Auth0User = User<AppMetadata, UserMetadata>;

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

  updateUser(userId: number, email: string): Promise<APIResponse<Auth0User>>;

  setAppMetadata(
    userId: number,
    metadata: AppMetadata
  ): Promise<APIResponse<{}>>;

  blockAccount(userId: number): Promise<APIResponse<{}>>;
}
