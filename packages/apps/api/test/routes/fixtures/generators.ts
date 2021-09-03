import * as crypto from 'crypto';
import { ExistingUser } from './mockedApi';

export const randomAlphanumeric = (length: number) =>
  crypto.randomBytes(length).toString('hex');

export const randomNumber = (max: number, min: number = 0) =>
  Math.floor(min + Math.random() * (max - min));

export const randomEmail = () =>
  `${randomAlphanumeric(5)}@${randomAlphanumeric(5)}.${randomAlphanumeric(3)}`;

export const randomExistingUser = (
  override: Partial<ExistingUser> = {}
): ExistingUser => ({
  userId: randomNumber(1e7, 1e8 - 1),
  email: randomEmail(),
  firstName: randomAlphanumeric(5),
  lastName: randomAlphanumeric(6),
  sourceSystems: ['sierra', 'auth0'],
  ...override,
});
