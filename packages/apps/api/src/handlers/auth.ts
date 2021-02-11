import Auth0Client from '@weco/auth0-client';
import {APIResponse, isNonBlank, ResponseStatus} from '@weco/identity-common';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import {Auth0Profile} from "@weco/auth0-client/lib/auth0";

export async function validateCredentials(auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const email: string = request.body.email;
  const password: string = request.body.password;

  if (!isNonBlank(email) || !isNonBlank(password)) {
    response.status(400).json(toMessage('All fields must be provided and non-blank'));
    return;
  }

  const userFetchResult: APIResponse<Auth0Profile> = await auth0Client.getUserByEmail(email);
  if (userFetchResult.status !== ResponseStatus.Success) {
    if (userFetchResult.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(userFetchResult.message));
    } else {
      response.status(500).json(toMessage(userFetchResult.message));
    }
    return;
  }

  const validationResult: APIResponse<{}> = await auth0Client.validateUserCredentials(email, password);
  if (validationResult.status !== ResponseStatus.Success) {
    if (validationResult.status === ResponseStatus.InvalidCredentials) {
      response.status(401).json(toMessage(validationResult.message));
    } else {
      response.status(500).json(toMessage(validationResult.message));
    }
    return;
  }

  response.sendStatus(200);
}
