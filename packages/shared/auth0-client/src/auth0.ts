export function toAuth0UserInfo(userInfo: any): Auth0UserInfo {
  const sub = userInfo.sub;
  return {
    // As far as the application is concerned, Auth0 ID's are identical to Sierra ID's. So remove the mandatory Auth0 prefix.
    userId: sub.slice(sub.indexOf('auth0|p') + 'auth0|p'.length),
    email: userInfo.email
  }
}

export function toAuth0Profile(auth0User: any): Auth0Profile {
  return {
    userId: auth0User.user_id,
    email: auth0User.email,
    emailValidated: auth0User.email_verified,
    creationDate: auth0User.created_at,
    locked: !!(auth0User.blocked), // Auth0 quirk - this attribute doesn't appear on Auth0 responses until it's been toggled off and on at least once.
    lastLogin: auth0User.last_login,
    lastLoginIp: auth0User.last_ip,
    totalLogins: auth0User.logins_count
  }
}

// A simple representation of the Auth0 user, using only the attributes we provide to Auth0 to create it.
export interface Auth0UserInfo {
  userId: number;
  email: string;
}

// An enhanced representation of the Auth0 user, it includes the various pieces of metadata which Auth0 provides about the user.
export interface Auth0Profile extends Auth0UserInfo {
  emailValidated: boolean,
  locked: boolean,
  creationDate: string,
  lastLogin: string,
  lastLoginIp: string,
  totalLogins: number
}
