import Auth0Client from '@weco/auth0-client';
import { ResponseStatus } from '@weco/identity-common';
import SierraClient from '@weco/sierra-client';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import { toUser } from '../models/user';

export async function getUser(sierraClient: SierraClient, auth0Client: Auth0Client, req: Request, res: Response): Promise<void> {
  return sierraClient.getPatronRecordByRecordNumber(req.params.user_id).then(sierraResponse => {
    if (sierraResponse.status === ResponseStatus.Success) {
      auth0Client.getProfile(req.params.user_id).then(auth0Response => {
        if (auth0Response.status === ResponseStatus.Success) {
          res.status(200).json(toUser(sierraResponse.result, auth0Response.result));
        } else if (auth0Response.status === ResponseStatus.NotFound) {
          res.status(404).json(toMessage(auth0Response.message));
        } else {
          res.status(500).json(toMessage(auth0Response.message));
        }
      });
    } else if (sierraResponse.status == ResponseStatus.NotFound) {
      res.status(404).json(toMessage(sierraResponse.message));
    } else {
      res.status(500).json(toMessage(sierraResponse.message));
    }
  });
}
