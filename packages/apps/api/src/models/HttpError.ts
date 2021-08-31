import { ErrorResponse, ResponseStatus } from '@weco/identity-common';

export class HttpError extends Error {
  public readonly status: number;
  public readonly message: string;

  constructor({ status, message }: { status: number; message?: string }) {
    super(message);
    this.status = status;
    this.message = message || '';
  }
}

export const clientResponseToHttpError = (response: ErrorResponse): HttpError =>
  new HttpError({
    status: (() => {
      switch (response.status) {
        case ResponseStatus.NotFound:
          return 404;
        case ResponseStatus.InvalidCredentials:
          return 401;
        case ResponseStatus.UserAlreadyExists:
          return 409;
        case ResponseStatus.MalformedRequest:
          return 400;
        case ResponseStatus.PasswordTooWeak:
          return 422;
        case ResponseStatus.QueryTimeout:
          return 503;
        case ResponseStatus.RateLimited:
          return 429;
        case ResponseStatus.UnknownError:
          return 500;
      }
    })(),
    message: response.message,
  });
