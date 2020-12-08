import { APIResponse, isNonBlank, ResponseStatus } from '@weco/identity-common';
import SierraClient from '@weco/sierra-client';
import { PatronRecord } from "@weco/sierra-client/lib/patron";
import { Request, Response } from 'express';
import { toMessage } from '../models/common';

export async function validateCredentials(sierraClient: SierraClient, request: Request, response: Response): Promise<void> {

  const email = request.body.email;
  const password = request.body.password;

  if (!isNonBlank(email) || !isNonBlank(password)) {
    response.status(400).json(toMessage("All fields must be provided and non-blank"));
  }

  const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByEmail(request.body.email);
  if (sierraGet.status === ResponseStatus.Success) {
    const sierraValidate: APIResponse<{}> = await sierraClient.validateCredentials(sierraGet.result.barcode, request.body.password);
    if (sierraValidate.status === ResponseStatus.Success) {
      response.status(200).end();
    } else if (sierraValidate.status === ResponseStatus.InvalidCredentials) {
      response.status(401).json(toMessage(sierraValidate.message));
    } else {
      response.status(500).json(toMessage(sierraValidate.message));
    }
  } else if (sierraGet.status === ResponseStatus.NotFound) {
    response.status(404).json(toMessage(sierraGet.message))
  } else {
    response.status(500).json(toMessage(sierraGet.message));
  }
}
