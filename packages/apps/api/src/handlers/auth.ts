import { ResponseStatus } from '@weco/identity-common';
import SierraClient from '@weco/sierra-client';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';

export async function validateCredentials(sierraClient: SierraClient, req: Request, res: Response): Promise<void> {
  sierraClient.getPatronRecordByEmail(req.body.email).then(response => {
    if (response.status === ResponseStatus.Success) {
      sierraClient.validateCredentials(response.result.barcode, req.body.password).then(response => {
        if (response.status === ResponseStatus.Success) {
          res.status(200).end();
        } else if (response.status === ResponseStatus.InvalidCredentials) {
          res.status(401).json(toMessage(response.message));
        } else {
          res.status(500).json(toMessage(response.message));
        }
      });
    } else if (response.status === ResponseStatus.NotFound) {
      res.status(404).json(toMessage(response.message))
    } else {
      res.status(500).json(toMessage(response.message));
    }
  });
}
