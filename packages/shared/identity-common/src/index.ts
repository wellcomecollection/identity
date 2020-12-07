import { AxiosError } from 'axios';

export function successResponse<T>(result: T): SuccessResponse<T> {
  return {
    result: result,
    status: ResponseStatus.Success
  }
}

export function errorResponse(error: AxiosError, message: string, status: ResponseStatus.NotFound | ResponseStatus.InvalidCredentials | ResponseStatus.UserAlreadyExists | ResponseStatus.MalformedRequest | ResponseStatus.UnknownError): ErrorResponse {
  const cause = error.response ? error.response.data : error.message;
  return {
    message: message + ' (cause: [' + cause + '])',
    status: status
  }
}

export function unhandledError(error: AxiosError): ErrorResponse {
  return errorResponse(error, 'Unhandled API response [' + error.message + ']', ResponseStatus.UnknownError);
}

export type SuccessResponse<T> = {
  result: T,
  status: ResponseStatus.Success
}

export type ErrorResponse = {
  message: string,
  status: ResponseStatus.NotFound | ResponseStatus.InvalidCredentials | ResponseStatus.UserAlreadyExists | ResponseStatus.MalformedRequest | ResponseStatus.UnknownError
}

export enum ResponseStatus {
  Success,
  NotFound,
  InvalidCredentials,
  UserAlreadyExists,
  MalformedRequest,
  UnknownError
}

export type APIResponse<T> = SuccessResponse<T> | ErrorResponse;
