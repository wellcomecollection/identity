import { AxiosError } from 'axios';

export function successResponse<T>(result: T): SuccessResponse<T> {
  return {
    result: result,
    status: ResponseStatus.Success
  }
}

export function errorResponse(error: AxiosError, message: string, status: ResponseStatus.NotFound | ResponseStatus.InvalidCredentials | ResponseStatus.UserAlreadyExists | ResponseStatus.MalformedRequest): ErrorResponse {
  return {
    message: message + '(cause: [' + JSON.stringify(error) + '])',
    status: status
  }
}

export function unhandledError(error: AxiosError): ErrorResponse {
  return {
    message: 'Unhandled API response [' + JSON.stringify(error)+ ']',
    status: ResponseStatus.UnknownError
  }
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
