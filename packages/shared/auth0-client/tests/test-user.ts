import { Auth0User } from '../src';
import { SierraConnection, SierraUserIdPrefix } from '../src/auth0';

export const userId: number = 123456;
export const firstName: string = 'Test';
export const lastName: string = 'User';
export const name: string = firstName + ' ' + lastName;
export const email: string = 'test.user@example.com';
export const password: string = 'superstrongpassword';
export const picture: string =
  'https://i1.wp.com/cdn.auth0.com/avatars/tu.png?ssl=1';
export const creationDate: string = '2020-11-18T14:27:34.766Z';
export const updatedDate: string = '2020-12-09T09:09:24.042Z';
export const passwordResetDate: string = '2020-11-19T12:03:02.999Z';
export const lastLoginDate: string = '2020-12-09T09:09:24.042Z';
export const lastLoginIp: string = '127.0.0.1';
export const totalLogins: number = 10;
export const emailValidated: boolean = true;
export const locked: boolean = false;

export const testUser: Auth0User = {
  created_at: creationDate,
  email: email,
  identities: [
    {
      user_id: 'p' + userId,
      provider: 'auth0',
      connection: SierraConnection,
      isSocial: false,
    },
  ],
  name: name,
  given_name: firstName,
  family_name: lastName,
  nickname: email.substring(0, email.lastIndexOf('@')),
  picture: picture,
  updated_at: updatedDate,
  user_id: SierraUserIdPrefix + userId,
  last_password_reset: passwordResetDate,
  email_verified: emailValidated,
  last_ip: lastLoginIp,
  last_login: lastLoginDate,
  logins_count: totalLogins,
};
