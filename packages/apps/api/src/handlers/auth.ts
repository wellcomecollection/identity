import Auth0Client from '@weco/auth0-client';
import { isNonBlank, ResponseStatus } from '@weco/identity-common';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';

export async function validateCredentials(auth0Client: Auth0Client, request: Request, response: Response) {
  const email: string = request.body.email;
  const password: string = request.body.password;

  if (!isNonBlank(email) || !isNonBlank(password)) {
    response.status(400).json(toMessage('All fields must be provided and non-blank'));
    return;
  }

  const userFetchResult = await auth0Client.getUserByEmail(email);
  if (userFetchResult.status != ResponseStatus.Success) {
    if (userFetchResult.status == ResponseStatus.NotFound) {
      response.status(404).json(toMessage(userFetchResult.message));
    } else {
      response.status(500).json(toMessage(userFetchResult.message));
    }

    return;
  }

  const validationResult = await auth0Client.validateUserCredentials(email, password);
  if (validationResult.status == ResponseStatus.Success) {
    response.sendStatus(200);
  } else if (validationResult.status == ResponseStatus.InvalidCredentials) {
    response.status(401).json(toMessage(validationResult.message));
  } else {
    response.status(500).json(toMessage(validationResult.message));
  }
}
