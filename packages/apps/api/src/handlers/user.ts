import Auth0Client from '@weco/auth0-client';
import { Auth0Profile } from "@weco/auth0-client/lib/auth0";
import { APIResponse, isNonBlank, ResponseStatus, truncate } from '@weco/identity-common';
import SierraClient from '@weco/sierra-client';
import { PatronRecord } from "@weco/sierra-client/lib/patron";
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import { toUser } from '../models/user';

export async function getUser(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const userId: number = Number(request.params.user_id);
  if (isNaN(userId)) {
    response.status(400).json(toMessage('Invalid user ID [' + userId + ']'));
    return;
  }

  const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByRecordNumber(userId);
  if (sierraGet.status != ResponseStatus.Success) {
    if (sierraGet.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(sierraGet.message));
    } else {
      response.status(500).json(toMessage(sierraGet.message));
    }
    return;
  }

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(userId);
  if (auth0Get.status != ResponseStatus.Success) {
    if (auth0Get.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Get.message));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  response.status(200).json(toUser(sierraGet.result, auth0Get.result));
}



export async function deleteUser(
  sierraClient: SierraClient,
  auth0Client: Auth0Client,
  request: Request,
  response: Response): Promise<void> {

  const userId: number = Number(request.params.user_id);
  if (isNaN(userId)) {
    response.status(400).json(toMessage('Invalid user ID [' + userId + ']'));
  }

  const auth0DeleteResult = await auth0Client.deleteUser(userId);
  if (auth0DeleteResult.status != ResponseStatus.Success) {
    if (auth0DeleteResult.status == ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0DeleteResult.message));
    } else {
      response.status(500).json(toMessage(auth0DeleteResult.message));
    }

    return;
  }


  const sierraDeleteResult = await sierraClient.deletePatronRecord(userId);
  if (sierraDeleteResult.status != ResponseStatus.Success) {
    if (sierraDeleteResult.status == ResponseStatus.NotFound) {
      response.status(404).json(toMessage(sierraDeleteResult.message));
    } else {
      response.status(500).json(toMessage(sierraDeleteResult.message));
    }

    return;
  }

  response.sendStatus(204);
}

export async function createUser(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const firstName: string = request.body.firstName;
  const lastName: string = request.body.lastName;
  const email: string = request.body.email;
  const password: string = request.body.password;
  if (!isNonBlank(firstName) || !isNonBlank(lastName) || !isNonBlank(email) || !isNonBlank(password)) {
    response.status(400).json(toMessage("All fields must be provided and non-blank"));
    return;
  }

  const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByEmail(email);
  if (sierraGet.status != ResponseStatus.NotFound) {
    if (sierraGet.status === ResponseStatus.Success) {
      response.status(409).json(toMessage('Patron record with email [' + email + '] already exists'));
    } else {
      response.status(500).json(toMessage(sierraGet.message));
    }
    return;
  }

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByEmail(email);
  if (auth0Get.status != ResponseStatus.NotFound) {
    if (auth0Get.status === ResponseStatus.Success) {
      response.status(409).json(toMessage('Auth0 user with email [' + email + '] already exists'));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  const sierraCreate: APIResponse<number> = await sierraClient.createPatronRecord(firstName, lastName, truncate(password, 30));
  if (sierraCreate.status != ResponseStatus.Success) {
    if (sierraCreate.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(sierraCreate.message));
    } else if (sierraCreate.status === ResponseStatus.PasswordTooWeak) {
      response.status(422).json(toMessage(sierraCreate.message));
    } else {
      response.status(500).json(toMessage(sierraCreate.message));
    }
    return;
  }

  const auth0Create: APIResponse<Auth0Profile> = await auth0Client.createUser(sierraCreate.result, email, password);
  if (auth0Create.status != ResponseStatus.Success) {
    await sierraClient.deletePatronRecord(sierraCreate.result);
    if (auth0Create.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(auth0Create.message));
    } else if (auth0Create.status === ResponseStatus.UserAlreadyExists) {
      response.status(409).json(toMessage(auth0Create.message));
    } else if (auth0Create.status === ResponseStatus.PasswordTooWeak) {
      response.status(422).json(toMessage(auth0Create.message));
    } else {
      response.status(500).json(toMessage(auth0Create.message));
    }
    return;
  }

  const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePatronPostCreationFields(sierraCreate.result, email);
  if (sierraUpdate.status != ResponseStatus.Success) {
    if (sierraUpdate.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(sierraUpdate.message));
    } else {
      response.status(500).json(toMessage(sierraUpdate.message));
    }
    return;
  }

  response.status(201).json(toUser(sierraUpdate.result, auth0Create.result));
}

export async function updateUser(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const userId: number = Number(request.params.user_id);
  if (isNaN(userId)) {
    response.status(400).json(toMessage('Invalid user ID [' + userId + ']'));
    return;
  }

  const email: string = request.body.email;
  if (!isNonBlank(email)) {
    response.status(400).json(toMessage("All fields must be provided and non-blank"));
    return;
  }

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByEmail(email);
  if (auth0Get.status != ResponseStatus.NotFound) {
    if (auth0Get.status === ResponseStatus.Success) {
      response.status(409).json(toMessage('Auth0 user with email [' + email + '] already exists'));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByEmail(email);
  if (sierraGet.status != ResponseStatus.NotFound) {
    if (sierraGet.status === ResponseStatus.Success) {
      response.status(409).json(toMessage('Patron record with email [' + email + '] already exists'));
    } else {
      response.status(500).json(toMessage(sierraGet.message));
    }
    return;
  }

  const auth0Update: APIResponse<Auth0Profile> = await auth0Client.updateUser(userId, email);
  if (auth0Update.status != ResponseStatus.Success) {
    if (auth0Update.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Update.message));
    } else if (auth0Update.status === ResponseStatus.UserAlreadyExists) {
      response.status(409).json(toMessage(auth0Update.message));
    } else if (auth0Update.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(auth0Update.message));
    } else {
      response.status(500).json(toMessage(auth0Update.message));
    }
    return;
  }

  const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePatronRecord(userId, email);
  if (sierraUpdate.status != ResponseStatus.Success) {
    if (sierraUpdate.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(sierraUpdate.message));
    } else if (sierraUpdate.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(sierraUpdate.message));
    } else {
      response.status(500).json(toMessage(sierraUpdate.message));
    }
    return;
  }

  response.status(200).json(toUser(sierraUpdate.result, auth0Update.result));
}

export async function changePassword(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const userId: number = Number(request.params.user_id);
  if (isNaN(userId)) {
    response.status(400).json(toMessage('Invalid user ID [' + userId + ']'));
    return;
  }

  const password: string = request.body.password;
  if (!isNonBlank(password)) {
    response.status(400).json(toMessage("All fields must be provided and non-blank"));
    return;
  }

  const auth0Update: APIResponse<Auth0Profile> = await auth0Client.updatePassword(userId, password);
  if (auth0Update.status != ResponseStatus.Success) {
    if (auth0Update.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Update.message));
    } else if (auth0Update.status === ResponseStatus.PasswordTooWeak) {
      response.status(422).json(toMessage(auth0Update.message));
    } else if (auth0Update.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(auth0Update.message));
    } else {
      response.status(500).json(toMessage(auth0Update.message));
    }
    return;
  }

  const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePassword(userId, truncate(password, 30));
  if (sierraUpdate.status != ResponseStatus.Success) {
    if (sierraUpdate.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(sierraUpdate.message));
    } else if (sierraUpdate.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(sierraUpdate.message));
    } else if (sierraUpdate.status === ResponseStatus.PasswordTooWeak) {
      response.status(422).json(toMessage(sierraUpdate.message));
    } else {
      response.status(500).json(toMessage(sierraUpdate.message));
    }
    return;
  }

  response.status(200).json(toUser(sierraUpdate.result, auth0Update.result));
}
