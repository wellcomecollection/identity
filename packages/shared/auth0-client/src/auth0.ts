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
