export {};

declare global {
  class WrongUsernameOrPasswordError extends Error {
    constructor(emailOrId?: string, message?: string);
  }
}
