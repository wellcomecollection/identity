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
    status: ResponseStatus.Success
  }
}

export function errorResponse(
  message: string,
  status: ResponseStatus.NotFound
    | ResponseStatus.InvalidCredentials
    | ResponseStatus.UserAlreadyExists
    | ResponseStatus.MalformedRequest
    | ResponseStatus.PasswordTooWeak
    | ResponseStatus.UnknownError,
  error?: AxiosError): ErrorResponse {
  const cause = error ? (error.response ? JSON.stringify(error.response.data) : error.message) : 'unknown';
  return {
    message: message + ' (cause: [' + cause + '])',
    status: status
  }
}

export function unhandledError(error: AxiosError): ErrorResponse {
  return errorResponse('Unhandled API response [' + error.message + ']', ResponseStatus.UnknownError, error);
}

export type SuccessResponse<T> = {
  result: T,
  status: ResponseStatus.Success
}

export type ErrorResponse = {
  message: string,
  status: ResponseStatus.NotFound
  | ResponseStatus.InvalidCredentials
  | ResponseStatus.UserAlreadyExists
  | ResponseStatus.MalformedRequest
  | ResponseStatus.PasswordTooWeak
  | ResponseStatus.UnknownError
}

export enum ResponseStatus {
  Success,
  NotFound,
  InvalidCredentials,
  UserAlreadyExists,
  MalformedRequest,
  PasswordTooWeak,
  UnknownError
}

export type APIResponse<T> = SuccessResponse<T> | ErrorResponse;
