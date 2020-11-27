import {AxiosError} from "axios";

export function successResponse<T>(result: T): SuccessResponse<T> {
  return {
    result: result,
    status: ResponseStatus.Success
  }
}

export function errorResponse(message: string, status: ResponseStatus.NotFound | ResponseStatus.InvalidCredentials): ErrorResponse {
  return {
    message: message,
    status: status
  }
}

export function unhandledError(error: AxiosError): ErrorResponse {
  return {
    message: 'Unexpected API response: [' + error.message + ']',
    status: ResponseStatus.UnknownError
  }
}

export type SuccessResponse<T> = {
  result: T,
  status: ResponseStatus.Success
}

export type ErrorResponse = {
  message: string,
  status: ResponseStatus.NotFound | ResponseStatus.InvalidCredentials | ResponseStatus.UnknownError
}

export enum ResponseStatus {
  Success,
  NotFound,
  InvalidCredentials,
  UnknownError
}

export type APIResponse<T> = SuccessResponse<T> | ErrorResponse;
