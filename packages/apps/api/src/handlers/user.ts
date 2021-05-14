import Auth0Client from '@weco/auth0-client';
import {
  Auth0Profile,
  Auth0SearchResults,
  Auth0SearchSortFields,
  SearchStatuses,
} from '@weco/auth0-client';
import {
  APIResponse,
  isNonBlank,
  ResponseStatus,
  truncate,
} from '@weco/identity-common';
import SierraClient, { PatronRecord } from '@weco/sierra-client';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import { toSearchResults, toUser } from '../models/user';
import EmailClient from '../utils/email';

export async function validatePassword(
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);
  const password: string = request.body.password;
  if (!isNonBlank(password)) {
    response
      .status(400)
      .json(toMessage('All fields must be provided and non-blank'));
    return;
  }

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
    userId
  );
  if (auth0Get.status !== ResponseStatus.Success) {
    if (auth0Get.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Get.message));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  const validationResult = await auth0Client.validateUserCredentials(
    extractSourceIp(request),
    auth0Get.result.email,
    password
  );
  if (validationResult.status !== ResponseStatus.Success) {
    if (validationResult.status === ResponseStatus.InvalidCredentials) {
      response.status(401).json(toMessage(validationResult.message));
    } else if (validationResult.status === ResponseStatus.RateLimited) {
      response.status(429).json(toMessage(validationResult.message));
    } else {
      response.status(500).json(toMessage(validationResult.message));
    }
    return;
  }

  response.sendStatus(200);
}

export async function getUser(
  sierraClient: SierraClient,
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByRecordNumber(
    userId
  );
  if (sierraGet.status !== ResponseStatus.Success) {
    if (sierraGet.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(sierraGet.message));
    } else {
      response.status(500).json(toMessage(sierraGet.message));
    }
    return;
  }

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
    userId
  );
  if (auth0Get.status !== ResponseStatus.Success) {
    if (auth0Get.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Get.message));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  response.status(200).json(toUser(auth0Get.result, sierraGet.result));
}

export async function createUser(
  sierraClient: SierraClient,
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const firstName: string = request.body.firstName;
  const lastName: string = request.body.lastName;
  const email: string = request.body.email;
  const password: string = request.body.password;
  if (
    !isNonBlank(firstName) ||
    !isNonBlank(lastName) ||
    !isNonBlank(email) ||
    !isNonBlank(password)
  ) {
    response
      .status(400)
      .json(toMessage('All fields must be provided and non-blank'));
    return;
  }

  const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByEmail(
    email
  );
  if (sierraGet.status !== ResponseStatus.NotFound) {
    if (sierraGet.status === ResponseStatus.Success) {
      response
        .status(409)
        .json(
          toMessage('Patron record with email [' + email + '] already exists')
        );
    } else {
      response.status(500).json(toMessage(sierraGet.message));
    }
    return;
  }

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByEmail(
    email
  );
  if (auth0Get.status !== ResponseStatus.NotFound) {
    if (auth0Get.status === ResponseStatus.Success) {
      response
        .status(409)
        .json(
          toMessage('Auth0 user with email [' + email + '] already exists')
        );
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  const sierraCreate: APIResponse<number> = await sierraClient.createPatronRecord(
    firstName,
    lastName,
    truncate(password, 30)
  );
  if (sierraCreate.status !== ResponseStatus.Success) {
    if (sierraCreate.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(sierraCreate.message));
    } else if (sierraCreate.status === ResponseStatus.PasswordTooWeak) {
      response.status(422).json(toMessage(sierraCreate.message));
    } else {
      response.status(500).json(toMessage(sierraCreate.message));
    }
    return;
  }

  const auth0Create: APIResponse<Auth0Profile> = await auth0Client.createUser(
    sierraCreate.result,
    firstName,
    lastName,
    email,
    password
  );
  if (auth0Create.status !== ResponseStatus.Success) {
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

  const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePatronPostCreationFields(
    sierraCreate.result,
    email
  );
  if (sierraUpdate.status !== ResponseStatus.Success) {
    if (sierraUpdate.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(sierraUpdate.message));
    } else {
      response.status(500).json(toMessage(sierraUpdate.message));
    }
    return;
  }

  response.status(201).json(toUser(auth0Create.result, sierraUpdate.result));
}

export async function updateUser(
  sierraClient: SierraClient,
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const auth0UserIdGet: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
    userId
  );
  if (auth0UserIdGet.status !== ResponseStatus.Success) {
    if (auth0UserIdGet.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0UserIdGet.message));
    } else {
      response.status(500).json(toMessage(auth0UserIdGet.message));
    }
    return;
  }
  const auth0Profile: Auth0Profile = auth0UserIdGet.result;

  const fields: { [key: string]: { value: string; modified: boolean } } = {
    email: {
      modified:
        !!request.body.email && request.body.email !== auth0Profile.email,
      get value() {
        return this.modified ? request.body.email : auth0Profile.email;
      },
    },
    firstName: {
      modified:
        !!request.body.firstName &&
        request.body.firstName !== auth0Profile.firstName,
      get value() {
        return this.modified ? request.body.firstName : auth0Profile.firstName;
      },
    },
    lastName: {
      modified:
        !!request.body.lastName &&
        request.body.lastName !== auth0Profile.lastName,
      get value() {
        return this.modified ? request.body.lastName : auth0Profile.lastName;
      },
    },
  };

  const modifiedFields: string[] = Object.keys(fields).filter(
    (field) => fields[field].modified
  );
  if (modifiedFields.length === 0) {
    response.sendStatus(304);
    return;
  }

  if (
    (modifiedFields.includes('firstName') ||
      modifiedFields.includes('lastName')) &&
    !userIsAdmin(request)
  ) {
    response
      .status(403)
      .json(
        toMessage(
          'Attempt to modify immutable fields [' +
            modifiedFields.join(',') +
            ']'
        )
      );
    return;
  }

  if (modifiedFields.includes('email')) {
    const auth0EmailGet: APIResponse<Auth0Profile> = await auth0Client.getUserByEmail(
      fields.email.value
    );
    if (auth0EmailGet.status !== ResponseStatus.NotFound) {
      if (
        auth0EmailGet.status === ResponseStatus.Success &&
        auth0EmailGet.result.userId !== userId.toString()
      ) {
        response
          .status(409)
          .json(
            toMessage(
              'Auth0 user with email [' +
                fields.email.value +
                '] already exists'
            )
          );
      } else if (auth0EmailGet.status === ResponseStatus.UnknownError) {
        response.status(500).json(toMessage(auth0EmailGet.message));
      }
      return;
    }

    const sierraEmailGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByEmail(
      fields.email.value
    );
    if (sierraEmailGet.status !== ResponseStatus.NotFound) {
      if (
        sierraEmailGet.status === ResponseStatus.Success &&
        sierraEmailGet.result.recordNumber !== userId
      ) {
        response
          .status(409)
          .json(
            toMessage(
              'Patron record with email [' +
                fields.email.value +
                '] already exists'
            )
          );
      } else if (sierraEmailGet.status === ResponseStatus.UnknownError) {
        response.status(500).json(toMessage(sierraEmailGet.message));
      }
      return;
    }
  }

  const auth0Update: APIResponse<Auth0Profile> = await auth0Client.updateUser(
    userId,
    fields.email.value,
    fields.firstName.value,
    fields.lastName.value
  );
  if (auth0Update.status !== ResponseStatus.Success) {
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

  const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePatronRecord(
    userId,
    fields.email.value
  );
  if (sierraUpdate.status !== ResponseStatus.Success) {
    if (sierraUpdate.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(sierraUpdate.message));
    } else if (sierraUpdate.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(sierraUpdate.message));
    } else {
      response.status(500).json(toMessage(sierraUpdate.message));
    }
    return;
  }

  response.status(200).json(toUser(auth0Update.result, sierraUpdate.result));
}

export async function changePassword(
  sierraClient: SierraClient,
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const password: string = request.body.password;
  if (!isNonBlank(password)) {
    response
      .status(400)
      .json(toMessage('All fields must be provided and non-blank'));
    return;
  }

  const auth0Update: APIResponse<Auth0Profile> = await auth0Client.updatePassword(
    userId,
    password
  );
  if (auth0Update.status !== ResponseStatus.Success) {
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

  const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePassword(
    userId,
    truncate(password, 30)
  );
  if (sierraUpdate.status !== ResponseStatus.Success) {
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

  response.sendStatus(200);
}

export async function searchUsers(
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const page: number = Number(request.query.page);
  const pageSize: number = Number(request.query.pageSize);
  const sort: string = request.query.sort as string;
  const sortDir: number = Number(request.query.sortDir);

  if (isNaN(page) || isNaN(pageSize) || !isNonBlank(sort) || isNaN(sortDir)) {
    response
      .status(400)
      .json(
        toMessage(
          'All fields [page, pageSize, sort, sortDir] must be provided and non-blank'
        )
      );
    return;
  }

  if (!Auth0SearchSortFields.get(sort)) {
    response
      .status(400)
      .json(
        toMessage(
          'Invalid sort field, one of [' +
            Array.from(Auth0SearchSortFields.keys()) +
            '] must be provided'
        )
      );
    return;
  }

  if (sortDir !== 1 && sortDir !== -1) {
    response
      .status(400)
      .json(
        toMessage(
          "'sortDir' must be '1' or '-1' to sort ascending and descending respectively"
        )
      );
    return;
  }

  const name: string | undefined = request.query.name as string | undefined;
  if (name && !isNonBlank(name)) {
    response
      .status(400)
      .json(toMessage("'name' was provided but was blank or empty"));
    return;
  }

  const email: string | undefined = request.query.email as string | undefined;
  if (email && !isNonBlank(email)) {
    response
      .status(400)
      .json(toMessage("'email' was provided but was blank or empty"));
    return;
  }

  const status: string | undefined = request.query.status as string | undefined;
  if (status && !SearchStatuses.includes(status)) {
    response
      .status(400)
      .json(toMessage("'status' must be one of [" + SearchStatuses + ']'));
    return;
  }

  const userSearch: APIResponse<Auth0SearchResults> = await auth0Client.searchUsers(
    page,
    pageSize,
    sort,
    sortDir,
    name,
    email,
    status
  );
  if (userSearch.status !== ResponseStatus.Success) {
    if (userSearch.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(userSearch.message));
    } else if (userSearch.status === ResponseStatus.QueryTimeout) {
      response.status(503).json(toMessage(userSearch.message));
    } else {
      response.status(500).json(toMessage(userSearch.message));
    }
    return;
  }

  response.status(200).json(toSearchResults(userSearch.result));
}

export async function sendVerificationEmail(
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const userGet: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
    userId
  );
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

  const sendVerification: APIResponse<{}> = await auth0Client.sendVerificationEmail(
    userId
  );
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

export async function sendPasswordResetEmail(
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const userGet: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
    userId
  );
  if (userGet.status !== ResponseStatus.Success) {
    if (userGet.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(userGet.message));
    } else {
      response.status(500).json(toMessage(userGet.message));
    }
    return;
  }

  const sendPasswordReset: APIResponse<{}> = await auth0Client.sendPasswordResetEmail(
    userGet.result.email
  );
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

export async function requestDelete(
  auth0Client: Auth0Client,
  emailClient: EmailClient,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
    userId
  );
  if (auth0Get.status !== ResponseStatus.Success) {
    if (auth0Get.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Get.message));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  if (auth0Get.result?.metadata?.deleteRequested) {
    response
      .status(304)
      .json(
        toMessage(
          'Deletion request already processing for user with ID [' +
            userId +
            ']'
        )
      );
    return;
  }

  const emailDeleteAdmin: APIResponse<{}> = await emailClient.sendDeleteRequestAdmin(
    auth0Get.result
  );
  if (emailDeleteAdmin.status !== ResponseStatus.Success) {
    response.status(500).json(toMessage(emailDeleteAdmin.message));
    return;
  }

  const auth0Update: APIResponse<{}> = await auth0Client.setAppMetadata(
    userId,
    {
      deleteRequested: new Date().toISOString(),
    }
  );
  if (auth0Update.status !== ResponseStatus.Success) {
    console.error(
      `An error occurred applying deletion flag to Auth0 record [${userId}]: [${auth0Update}]`
    );
  }

  const auth0Block: APIResponse<{}> = await auth0Client.blockAccount(userId);
  if (auth0Block.status !== ResponseStatus.Success) {
    console.error(
      `An error occurred blocking Auth0 record [${userId}]: [${auth0Block}]`
    );
  }

  const emailDeleteUser: APIResponse<{}> = await emailClient.sendDeleteRequestUser(
    auth0Get.result
  );
  if (emailDeleteUser.status !== ResponseStatus.Success) {
    console.error(
      `An error occurred notifying Auth0 user [${userId}] of the deletion request: [${emailDeleteUser}]`
    );
  }

  response.sendStatus(200);
}

export async function removeDelete(
  auth0Client: Auth0Client,
  emailClient: EmailClient,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
    userId
  );
  if (auth0Get.status !== ResponseStatus.Success) {
    if (auth0Get.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Get.message));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  if (!auth0Get.result?.metadata?.deleteRequested) {
    response
      .status(304)
      .json(
        toMessage('No deletion requests for user with ID [' + userId + ']')
      );
    return;
  }

  const metadata: Record<string, string> = auth0Get.result.metadata;
  delete metadata.deleteRequested;

  const auth0Update: APIResponse<{}> = await auth0Client.setAppMetadata(
    userId,
    metadata
  );
  if (auth0Update.status !== ResponseStatus.Success) {
    if (auth0Update.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(auth0Update.message));
    } else if (auth0Update.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Update.message));
    } else {
      response.status(500).json(toMessage(auth0Update.message));
    }
    return;
  }

  const auth0Unblock: APIResponse<{}> = await auth0Client.unblockAccount(
    userId
  );
  if (auth0Unblock.status !== ResponseStatus.Success) {
    if (auth0Unblock.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(auth0Unblock.message));
    } else if (auth0Unblock.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Unblock.message));
    } else {
      response.status(500).json(toMessage(auth0Unblock.message));
    }
    return;
  }

  const emailDeleteRemovalUser: APIResponse<{}> = await emailClient.sendDeleteRemovalUser(
    auth0Get.result
  );
  if (emailDeleteRemovalUser.status !== ResponseStatus.Success) {
    console.error(
      `An error occurred notifying Auth0 user [${userId}] of the deletion removal request: [${emailDeleteRemovalUser}]`
    );
  }

  response.sendStatus(204);
}

export async function lockUser(
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const blockUser: APIResponse<{}> = await auth0Client.blockAccount(userId);
  if (blockUser.status !== ResponseStatus.Success) {
    if (blockUser.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(blockUser.message));
    } else if (blockUser.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(blockUser.message));
    } else {
      response.status(500).json(toMessage(blockUser.message));
    }
    return;
  }

  response.sendStatus(200);
}

export async function removeUserLock(
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
    userId
  );
  if (auth0Get.status !== ResponseStatus.Success) {
    if (auth0Get.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Get.message));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
    return;
  }

  if (!auth0Get.result.locked) {
    response.status(304).json(toMessage('User is not locked'));
    return;
  }

  const unblockUser: APIResponse<{}> = await auth0Client.unblockAccount(userId);
  if (unblockUser.status !== ResponseStatus.Success) {
    if (unblockUser.status === ResponseStatus.MalformedRequest) {
      response.status(400).json(toMessage(unblockUser.message));
    } else if (unblockUser.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(unblockUser.message));
    } else {
      response.status(500).json(toMessage(unblockUser.message));
    }
    return;
  }

  response.sendStatus(204);
}

export async function deleteUser(
  sierraClient: SierraClient,
  auth0Client: Auth0Client,
  request: Request,
  response: Response
): Promise<void> {
  const userId: number = getTargetUserId(request);

  const auth0Delete: APIResponse<{}> = await auth0Client.deleteUser(userId);
  if (auth0Delete.status !== ResponseStatus.Success) {
    if (auth0Delete.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Delete.message));
    } else {
      response.status(500).json(toMessage(auth0Delete.message));
    }
    return;
  }

  const patronDelete: APIResponse<{}> = await sierraClient.deletePatronRecord(
    userId
  );
  if (patronDelete.status !== ResponseStatus.Success) {
    if (patronDelete.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(patronDelete.message));
    } else {
      response.status(500).json(toMessage(patronDelete.message));
    }
    return;
  }

  response.sendStatus(204);
}

function extractSourceIp(request: Request): string {
  if (!request.apiGateway) {
    throw new Error(
      "API Gateway event and context data doesn't exist on request"
    );
  }
  return request.apiGateway?.event.requestContext.identity.sourceIp;
}

function getTargetUserId(request: Request): number {
  if (request.params.user_id === 'me') {
    if (userIsAdmin(request)) {
      throw new Error('Administrator users cannot operate on themselves');
    }

    const callerId: number = Number(
      request.apiGateway?.event.requestContext.authorizer?.callerId
    );
    if (isNaN(callerId)) {
      throw new Error(
        `Caller attempted to operate on themself, but has an invalid user ID: [${callerId}]`
      );
    }

    return callerId;
  }

  const targetUserId: number = Number(request.params.user_id);
  if (isNaN(targetUserId)) {
    throw new Error(`Invalid user ID [${targetUserId}]`);
  }

  return targetUserId;
}

function userIsAdmin(request: Request): boolean {
  const isAdmin: string | null | undefined =
    request.apiGateway?.event.requestContext.authorizer?.isAdmin;
  return !!isAdmin && /true/i.test(isAdmin);
}
