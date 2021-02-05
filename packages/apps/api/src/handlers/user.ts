import Auth0Client from '@weco/auth0-client';
import { Auth0Profile, Auth0SearchResults, Auth0SearchSortFields } from '@weco/auth0-client/lib/auth0';
import { APIResponse, isNonBlank, ResponseStatus, truncate } from '@weco/identity-common';
import SierraClient from '@weco/sierra-client';
import { PatronRecord } from '@weco/sierra-client/lib/patron';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import { toUser } from '../models/user';
import EmailClient from "./email";

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

export async function createUser(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const firstName: string = request.body.firstName;
  const lastName: string = request.body.lastName;
  const email: string = request.body.email;
  const password: string = request.body.password;
  if (!isNonBlank(firstName) || !isNonBlank(lastName) || !isNonBlank(email) || !isNonBlank(password)) {
    response.status(400).json(toMessage('All fields must be provided and non-blank'));
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

  const auth0Create: APIResponse<Auth0Profile> = await auth0Client.createUser(sierraCreate.result, firstName, lastName, email, password);
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
    response.status(400).json(toMessage('All fields must be provided and non-blank'));
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
    response.status(400).json(toMessage('All fields must be provided and non-blank'));
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

export async function searchUsers(auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const page: number = Number(request.query.page);
  const pageSize: number = Number(request.query.pageSize);
  const sort: string = request.query.sort as string;
  const sortDir: number = Number(request.query.sortDir);
  const query: string = request.query.query as string;
  if (isNaN(page) || isNaN(pageSize) || !isNonBlank(query) || !isNonBlank(sort) || isNaN(sortDir)) {
    response.status(400).json(toMessage('All fields must be provided and non-blank'));
    return;
  }

  if (!Auth0SearchSortFields.get(sort)) {
    response.status(400).json(toMessage('Invalid sort field, one of [' + Array.from(Auth0SearchSortFields.keys()) + '] must be provided'));
    return;
  }

  if (sortDir !== 1 && sortDir !== -1) {
    response.status(400).json(toMessage('\'sortDir\' must be \'1\' or \'-1\' to sort ascending and descending respectively'))
    return;
  }

  const userSearch: APIResponse<Auth0SearchResults> = await auth0Client.searchUsers(page, pageSize, sort, sortDir, query);
  if (userSearch.status != ResponseStatus.Success) {
    if (userSearch.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(userSearch.message));
    } else if (userSearch.status === ResponseStatus.QueryTimeout) {
      response.status(503).json(toMessage(userSearch.message));
    } else {
      response.status(500).json(toMessage(userSearch.message));
    }
    return;
  }

  response.status(200).json(userSearch.result);
}

export async function sendVerificationEmail(auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const userId: number = Number(request.params.user_id);
  if (isNaN(userId)) {
    response.status(400).json(toMessage('Invalid user ID [' + userId + ']'));
    return;
  }

  const userGet = await auth0Client.getUserByUserId(userId);
  if (userGet.status !== ResponseStatus.Success) {
    if (userGet.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(userGet.message));
    } else {
      response.status(500).json(toMessage(userGet.message));
    }
    return;
  }

  if (userGet.result.emailValidated) {
    response.status(304).json(toMessage('Email address already validated'));
    return;
  }

  const sendVerification = await auth0Client.sendVerificationEmail(userId);
  if (sendVerification.status !== ResponseStatus.Success) {
    if (sendVerification.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(sendVerification.message));
    } else {
      response.status(500).json(toMessage(sendVerification.message));
    }
    return;
  }

  response.sendStatus(200);
}

export async function sendPasswordResetEmail(auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const userId: number = Number(request.params.user_id);
  if (isNaN(userId)) {
    response.status(400).json(toMessage('Invalid user ID [' + userId + ']'));
    return;
  }

  const userGet = await auth0Client.getUserByUserId(userId);
  if (userGet.status !== ResponseStatus.Success) {
    if (userGet.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(userGet.message));
    } else {
      response.status(500).json(toMessage(userGet.message));
    }
    return;
  }

  const sendPasswordReset = await auth0Client.sendPasswordResetEmail(userGet.result.email);
  if (sendPasswordReset.status !== ResponseStatus.Success) {
    if (sendPasswordReset.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(sendPasswordReset.message));
    } else {
      response.status(500).json(toMessage(sendPasswordReset.message));
    }
    return;
  }

  response.sendStatus(200);
}

export async function requestDelete(auth0Client: Auth0Client, sierraClient: SierraClient, emailClient: EmailClient, request: Request, response: Response): Promise<void> {

  const userId: number = Number(request.params.user_id);
  if (isNaN(userId)) {
    response.status(400).json(toMessage('Invalid user ID [' + userId + ']'));
    return;
  }

  const auth0Get = await auth0Client.getUserByUserId(userId);
  if (auth0Get.status !== ResponseStatus.Success) {
    if (auth0Get.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Get.message));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  if (auth0Get.result?.metadata?.requestDeleted) {
    response.status(304).json(toMessage('Deletion request already processing for user with ID [' + userId + ']'));
  }

  const emailDeleteAdmin = await emailClient.sendDeleteRequestAdmin(auth0Get.result);
  if (emailDeleteAdmin.status !== ResponseStatus.Success) {
    response.status(500).json(toMessage(emailDeleteAdmin.message));
    return;
  }

  const auth0Update = await auth0Client.addAppMetadata(userId, {
    deleteRequested: new Date().toISOString()
  });
  if (auth0Update.status !== ResponseStatus.Success) {
    console.log("An error occurred applying deletion flag to Auth0 record [" + userId + "]: [" + auth0Update + "]");
  }

  const auth0Block = await auth0Client.blockAccount(userId);
  if (auth0Block.status !== ResponseStatus.Success) {
    console.log("An error blocking Auth0 record [" + userId + "]: [" + auth0Block + "]");
  }

  const emailDeleteUser = await emailClient.sendDeleteRequestUser(auth0Get.result);
  if (emailDeleteUser.status !== ResponseStatus.Success) {
    console.log("An error notifying Auth0 user [" + userId + "] of the deletion request: [" + emailDeleteUser + "]");
  }

  response.sendStatus(200);
}
