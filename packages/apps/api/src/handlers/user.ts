import Auth0Client from '@weco/auth0-client';
import { ResponseStatus } from '@weco/identity-common';
import SierraClient from '@weco/sierra-client';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import { toUser } from '../models/user';

export async function getUser(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {
  return sierraClient.getPatronRecordByRecordNumber(BigInt(request.params.user_id)).then(sierraResponse => {
    if (sierraResponse.status === ResponseStatus.Success) {
      return auth0Client.getProfileByUserId(request.params.user_id).then(auth0Response => {
        if (auth0Response.status === ResponseStatus.Success) {
          response.status(200).json(toUser(sierraResponse.result, auth0Response.result));
        } else if (auth0Response.status === ResponseStatus.NotFound) {
          response.status(404).json(toMessage(auth0Response.message));
        } else {
          response.status(500).json(toMessage(auth0Response.message));
        }
      });
    } else if (sierraResponse.status == ResponseStatus.NotFound) {
      response.status(404).json(toMessage(sierraResponse.message));
    } else {
      response.status(500).json(toMessage(sierraResponse.message));
    }
  });
}

export async function createUser(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {
  return sierraClient.getPatronRecordByEmail(request.params.email).then(sierraResponse => {
    if (sierraResponse.status === ResponseStatus.NotFound) {
      return auth0Client.createAccount(request.body.email, request.body.password).then(auth0Response => {
        if (auth0Response.status === ResponseStatus.Success) {
          return sierraClient.createPatronRecord(request.body.title, request.body.firstName, request.body.lastName, request.body.email, request.body.password).then(sierraResponse => {
            if (sierraResponse.status === ResponseStatus.Success) {
              response.status(201).json(toUser(sierraResponse.result, auth0Response.result));
            } else if (sierraResponse.status === ResponseStatus.UserAlreadyExists) {
              response.status(409).json(toMessage(sierraResponse.message));
            } else {
              response.status(500).json(toMessage(sierraResponse.message));
            }
          });
        } else if (auth0Response.status === ResponseStatus.UserAlreadyExists) {
          response.status(409).json(toMessage(auth0Response.message));
        } else {
          response.status(500).json(toMessage(auth0Response.message));
        }
      });
    } else if (sierraResponse.status === ResponseStatus.Success) {
      response.status(409).json(toMessage('Patron Record with email [' + request.params.email + '] already exists'));
    } else {
      response.status(500).json(toMessage(sierraResponse.message));
    }
  });
}
