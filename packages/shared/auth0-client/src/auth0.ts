import { AxiosResponse } from 'axios';

const USER_ID_PREFIX: string = 'auth0|p';

export function toAuth0UserId(userId: number): string {
  return USER_ID_PREFIX + userId;
}

export function toUserInfo(response: AxiosResponse): Auth0UserInfo {
  const sub = response.data.sub;
  return {
    userId: sub.slice(sub.indexOf(USER_ID_PREFIX) + USER_ID_PREFIX.length),
    email: response.data.email
  }
}

export function toUserProfile(data: any): Auth0Profile {
  return {
    userId: data.user_id,
    email: data.email,
    emailValidated: data.email_verified,
    locked: data.blocked ? data.blocked : false,
    creationDate: data.created_at,
    lastLogin: data.last_login,
    lastLoginIp: data.last_ip,
    totalLogins: data.logins_count
  }
}

export interface Auth0UserInfo {
  userId: number;
  email: string;
}

export interface Auth0Profile extends Auth0UserInfo {
  emailValidated: boolean,
  locked: boolean,
  creationDate: string,
  lastLogin: string,
  lastLoginIp: string,
  totalLogins: number
}
