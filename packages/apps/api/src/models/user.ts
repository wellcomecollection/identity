import { Auth0User } from '@weco/auth0-client';

export function toUser(auth0Profile: Auth0User): User {
  return {
    userId: Number(auth0Profile.user_id), // @TODO is this safe?
    barcode: auth0Profile.app_metadata?.barcode,
    firstName: auth0Profile.given_name,
    lastName: auth0Profile.family_name,
    email: auth0Profile.email!,
    emailValidated: !!auth0Profile.email_verified,
    locked: !!auth0Profile.blocked,
    creationDate: auth0Profile.created_at!,
    updatedDate: auth0Profile.updated_at!,
    lastLoginDate: auth0Profile.last_login,
    lastLoginIp: auth0Profile.last_ip,
    totalLogins: auth0Profile.logins_count,
    deleteRequested: auth0Profile.app_metadata?.deleteRequested,
  };
}

export interface User {
  userId: number;
  barcode?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  emailValidated: boolean;
  locked: boolean;
  creationDate: string;
  updatedDate: string;
  lastLoginDate?: string;
  lastLoginIp?: string;
  totalLogins?: number;
  deleteRequested?: string;
}
