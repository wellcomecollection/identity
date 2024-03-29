import { User } from 'auth0';

export const SierraConnection = 'Sierra-Connection';
export const SierraUserIdPrefix = 'auth0|p';

export const auth0IdToPublic = (subjectClaim?: string): string | undefined => {
  if (subjectClaim?.startsWith(SierraUserIdPrefix)) {
    return subjectClaim.slice(SierraUserIdPrefix.length);
  } else {
    return undefined;
  }
};

// See https://auth0.com/docs/users/metadata#metadata-types
// for the difference between these.
export type UserMetadata = {};

export type AppMetadata = {
  role: string;
  barcode?: string;
  deleteRequested?: string;
  terms_and_conditions_accepted?: boolean;
};

// Makes the keys K of T required
type WithRequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Auth0User = WithRequiredFields<
  User<AppMetadata, UserMetadata>,
  'user_id' | 'email' // These fields are always present once the user is created
>;

// In the create script we want to be able to get the password from the user object
// Before creation the user has no ID
// https://auth0.com/docs/authenticate/database-connections/custom-db/templates/create#user-object-parameter
export type Auth0UserWithPassword = Omit<Auth0User, 'user_id'> & {
  password: string;
};
