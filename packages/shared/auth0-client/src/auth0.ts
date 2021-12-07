export const SierraConnection = 'Sierra-Connection';
export const SierraUserIdPrefix = 'auth0|p';

// See https://auth0.com/docs/users/metadata#metadata-types
// for the difference between these.
export type UserMetadata = {};
export type AppMetadata = {
  barcode?: string;
  deleteRequested?: string;
};
