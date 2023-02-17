export {};

declare global {
  // Some custom errors are available:
  // https://auth0.com/docs/connections/database/custom-db/error-handling#types-of-errors
  class WrongUsernameOrPasswordError extends Error {
    constructor(emailOrId?: string, message?: string);
  }

  class ValidationError extends Error {
    constructor(errorCode?: string, message?: string);
  }
}
