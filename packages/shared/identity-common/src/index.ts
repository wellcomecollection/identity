import { AxiosError } from 'axios';

export function isNonBlank(str: string): boolean {
  return !!(str && /\S/.test(str));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  return str.substr(0, length);
}

export function successResponse<T>(result: T): SuccessResponse<T> {
  return {
    result: result,
    status: ResponseStatus.Success,
  };
}

export function errorResponse(
  message: string,
  status:
    | ResponseStatus.NotFound
    | ResponseStatus.InvalidCredentials
    | ResponseStatus.UserAlreadyExists
    | ResponseStatus.DuplicateUsers
    | ResponseStatus.MalformedRequest
    | ResponseStatus.PasswordTooWeak
    | ResponseStatus.QueryTimeout
    | ResponseStatus.RateLimited
    | ResponseStatus.UnknownError,
  error?: Error
): ErrorResponse {
  let cause: string = '';
  if (error) {
    if (isAxiosError(error) && error.response) {
      cause = JSON.stringify(error.response.data);
    } else {
      cause = error.message;
    }
  } else {
    cause = 'unknown';
  }

  return {
    message: message + ' (cause: [' + cause + '])',
    status: status,
  };
}

export function responseCodeIs(responseCode: number) {
  return (status: number) => status === responseCode;
}

export function unhandledError(error: Error): ErrorResponse {
  return errorResponse(
    'Unhandled API response [' + error.message + ']',
    ResponseStatus.UnknownError,
    error
  );
}

function isAxiosError(error?: Error): error is AxiosError {
  return (error as AxiosError).response !== undefined;
}

export type SuccessResponse<T> = {
  result: T;
  status: ResponseStatus.Success;
};

export type ErrorResponse = {
  message: string;
  status:
    | ResponseStatus.NotFound
    | ResponseStatus.InvalidCredentials
    | ResponseStatus.UserAlreadyExists
    | ResponseStatus.DuplicateUsers
    | ResponseStatus.MalformedRequest
    | ResponseStatus.PasswordTooWeak
    | ResponseStatus.QueryTimeout
    | ResponseStatus.RateLimited
    | ResponseStatus.UnknownError;
};

export enum ResponseStatus {
  Success,
  NotFound,
  InvalidCredentials,
  UserAlreadyExists,
  DuplicateUsers,
  MalformedRequest,
  PasswordTooWeak,
  QueryTimeout,
  RateLimited,
  UnknownError,
}

export type APIResponse<T> = SuccessResponse<T> | ErrorResponse;

export {
  authenticatedInstanceFactory,
  hasTempName,
  REGISTRATION_NAME_PREFIX,
} from './auth';
