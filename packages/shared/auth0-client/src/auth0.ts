import { AxiosResponse } from 'axios';

export function toUserInfo(response: AxiosResponse): Auth0UserInfo {
  const sub = response.data.sub;
  return {
    userId: sub.slice(sub.indexOf('auth0|p') + 'auth0|p'.length),
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
