import { User } from 'auth0';

export const SierraConnection = 'Sierra-Connection';
export const SierraUserIdPrefix = 'auth0|p';

export const auth0IdToPublic = (subjectClaim?: string): string | undefined => {
  if (subjectClaim?.startsWith(SierraUserIdPrefix)) {
    return subjectClaim.slice(SierraUserIdPrefix.length);
  } else {
    return subjectClaim;
  }
};

// See https://auth0.com/docs/users/metadata#metadata-types
// for the difference between these.
export type UserMetadata = {};
export type AppMetadata = {
  barcode?: string;
  deleteRequested?: string;
};

// Makes the keys K of T required
type WithRequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Auth0User = WithRequiredFields<
  User<AppMetadata, UserMetadata>,
  'user_id' | 'email' // These fields are always present
>;
