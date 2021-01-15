import { APIResponse, isNonBlank, ResponseStatus } from '@weco/identity-common';
import SierraClient from '@weco/sierra-client';
import { PatronRecord } from "@weco/sierra-client/lib/patron";
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import Auth0Client from "@weco/auth0-client";

export async function validateCredentials(auth0Client: Auth0Client, request: Request, response: Response) {
  const email: string = request.body.email;
  const password: string = request.body.password;

  if (!isNonBlank(email) || !isNonBlank(password)) {
    response.status(400).json(toMessage("All fields must be provided and non-blank"));
  }

  const validationResult = await auth0Client.validateUserCredentials(email, password);
  if (validationResult.status == ResponseStatus.Success) {
    response.sendStatus(200);
  } else {
    response.sendStatus(401);
  }
}
