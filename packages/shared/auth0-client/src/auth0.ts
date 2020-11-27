import {AxiosResponse} from "axios";

const USER_ID_PREFIX: string = "auth0|p";

export function toAuth0UserId(userId: string): string {
  return USER_ID_PREFIX + userId;
}

export function toUserInfo(response: AxiosResponse): Auth0UserInfo {
  const sub = response.data.sub;
  return {
    userId: sub.slice(sub.indexOf(USER_ID_PREFIX) + USER_ID_PREFIX.length),
    email: response.data.email
  }
}

export function toUserProfile(response: AxiosResponse): Auth0Profile {
  return {
    userId: response.data.user_id,
    email: response.data.email,
    emailValidated: response.data.email_verified,
    locked: response.data.blocked,
    creationDate: response.data.created_at,
    lastLogin: response.data.last_login,
    lastLoginIp: response.data.last_ip,
    totalLogins: response.data.logins_count
  }
}

export interface Auth0UserInfo {
  userId: string;
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
