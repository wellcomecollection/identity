import {
  Auth0Client,
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
import { SierraClient, PatronRecord } from '@weco/sierra-client';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import { clientResponseToHttpError, HttpError } from '../models/HttpError';
import { toSearchResults, toUser } from '../models/user';
import { EmailClient } from '../utils/EmailClient';

export function validatePassword(auth0Client: Auth0Client) {
  const checkPassword = passwordCheckerForUser(auth0Client);
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);
    const password: string = request.body.password;
    if (!isNonBlank(password)) {
      throw new HttpError({
        status: 400,
        message: 'A password must be provided and non-blank',
      });
    }
    const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
      userId
    );
    if (auth0Get.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Get);
    }

    await checkPassword(
      auth0Get.result.email,
      password,
      extractSourceIp(request)
    );

    response.sendStatus(200);
  };
}

export function getUser(sierraClient: SierraClient, auth0Client: Auth0Client) {
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);

    const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByRecordNumber(
      userId
    );
    if (sierraGet.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(sierraGet);
    }

    const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
      userId
    );
    if (auth0Get.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Get);
    }

    response.status(200).json(toUser(auth0Get.result, sierraGet.result));
  };
}

export function createUser(
  sierraClient: SierraClient,
  auth0Client: Auth0Client
) {
  return async function (request: Request, response: Response): Promise<void> {
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
      throw new HttpError({
        status: 400,
        message: 'A password must be provided and non-blank',
      });
    }

    const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByEmail(
      email
    );
    if (sierraGet.status === ResponseStatus.Success) {
      throw new HttpError({
        status: 409,
        message: `Patron record with email [${email}] already exists`,
      });
    } else if (sierraGet.status !== ResponseStatus.NotFound) {
      console.error('Unexpected error from Sierra client', sierraGet.message);
      throw new HttpError({
        status: 500,
      });
    }

    const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByEmail(
      email
    );
    if (auth0Get.status === ResponseStatus.Success) {
      throw new HttpError({
        status: 409,
        message: `Auth0 user with email [${email}] already exists`,
      });
    } else if (auth0Get.status !== ResponseStatus.NotFound) {
      console.error('Unexpected error from Auth0 client', auth0Get.message);
      throw new HttpError({
        status: 500,
      });
    }

    const sierraCreate: APIResponse<number> = await sierraClient.createPatronRecord(
      firstName,
      lastName,
      truncate(password, 30)
    );
    if (sierraCreate.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(sierraCreate);
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
      throw clientResponseToHttpError(auth0Create);
    }

    const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePatronPostCreationFields(
      sierraCreate.result,
      email
    );
    if (sierraUpdate.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(sierraUpdate);
    }

    response.status(201).json(toUser(auth0Create.result, sierraUpdate.result));
  };
}

export function updateUser(
  sierraClient: SierraClient,
  auth0Client: Auth0Client
) {
  const checkPassword = passwordCheckerForUser(auth0Client);
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);
    const password: string | undefined = request.body.password;

    const auth0UserIdGet: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
      userId
    );
    if (auth0UserIdGet.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0UserIdGet);
    }
    const auth0Profile: Auth0Profile = auth0UserIdGet.result;

    if (!userIsAdmin(request)) {
      if (!password) {
        throw new HttpError({
          status: 400,
          message: 'Current password must be provided',
        });
      }

      await checkPassword(
        auth0Profile.email,
        password,
        extractSourceIp(request)
      );
    }

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
          return this.modified
            ? request.body.firstName
            : auth0Profile.firstName;
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
      throw new HttpError({
        status: 403,
        message: `Attempt to modify immutable fields [${modifiedFields.join(
          ','
        )}]`,
      });
    }

    if (modifiedFields.includes('email')) {
      const auth0EmailGet: APIResponse<Auth0Profile> = await auth0Client.getUserByEmail(
        fields.email.value
      );
      if (auth0EmailGet.status === ResponseStatus.Success) {
        if (auth0EmailGet.result.userId !== userId.toString()) {
          throw new HttpError({
            status: 409,
            message: `Auth0 user with email [${fields.email.value}] already exists`,
          });
        }
      } else if (auth0EmailGet.status !== ResponseStatus.NotFound) {
        console.error(
          'Unexpected error from Auth0 client',
          auth0EmailGet.message
        );
        throw new HttpError({
          status: 500,
        });
      }

      const sierraEmailGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByEmail(
        fields.email.value
      );
      if (sierraEmailGet.status === ResponseStatus.Success) {
        if (sierraEmailGet.result.recordNumber === userId) {
          throw new HttpError({
            status: 409,
            message: `Patron record with email [${fields.email.value}] already exists`,
          });
        }
      } else if (sierraEmailGet.status !== ResponseStatus.NotFound) {
        console.error(
          'Unexpected error from Sierra client',
          sierraEmailGet.message
        );
        throw new HttpError({
          status: 500,
        });
      }
    }

    const auth0Update: APIResponse<Auth0Profile> = await auth0Client.updateUser(
      userId,
      fields.email.value,
      fields.firstName.value,
      fields.lastName.value
    );
    if (auth0Update.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Update);
    }

    const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePatronRecord(
      userId,
      fields.email.value
    );
    if (sierraUpdate.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(sierraUpdate);
    }

    response.status(200).json(toUser(auth0Update.result, sierraUpdate.result));
  };
}

export function changePassword(
  sierraClient: SierraClient,
  auth0Client: Auth0Client
) {
  const checkPassword = passwordCheckerForUser(auth0Client);
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);

    const newPassword: string = request.body.newPassword;
    const oldPassword: string = request.body.password;
    if (!isNonBlank(newPassword) || !isNonBlank(oldPassword)) {
      throw new HttpError({
        status: 400,
        message: 'All fields must be provided and non-blank',
      });
    }

    const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
      userId
    );
    if (auth0Get.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Get);
    }

    await checkPassword(
      auth0Get.result.email,
      oldPassword,
      extractSourceIp(request)
    );

    const auth0Update: APIResponse<Auth0Profile> = await auth0Client.updatePassword(
      userId,
      newPassword
    );
    if (auth0Update.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Update);
    }

    const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePassword(
      userId,
      truncate(newPassword, 30)
    );
    if (sierraUpdate.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(sierraUpdate);
    }

    response.sendStatus(200);
  };
}

export function searchUsers(auth0Client: Auth0Client) {
  return async function (request: Request, response: Response): Promise<void> {
    const page: number = Number(request.query.page);
    const pageSize: number = Number(request.query.pageSize);
    const sort: string = request.query.sort as string;
    const sortDir: number = Number(request.query.sortDir);

    if (isNaN(page) || isNaN(pageSize) || !isNonBlank(sort) || isNaN(sortDir)) {
      throw new HttpError({
        status: 400,
        message:
          'All fields [page, pageSize, sort, sortDir] must be provided and non-blank',
      });
    }

    if (!Auth0SearchSortFields.get(sort)) {
      throw new HttpError({
        status: 400,
        message:
          'Invalid sort field, one of [' +
          Array.from(Auth0SearchSortFields.keys()) +
          '] must be provided',
      });
    }

    if (sortDir !== 1 && sortDir !== -1) {
      throw new HttpError({
        status: 400,
        message:
          "'sortDir' must be '1' or '-1' to sort ascending and descending respectively",
      });
    }

    const name: string | undefined = request.query.name as string | undefined;
    if (name && !isNonBlank(name)) {
      throw new HttpError({
        status: 400,
        message: "'name' was provided but was blank or empty",
      });
    }

    const email: string | undefined = request.query.email as string | undefined;
    if (email && !isNonBlank(email)) {
      throw new HttpError({
        status: 400,
        message: "'email' was provided but was blank or empty",
      });
    }

    const status: string | undefined = request.query.status as
      | string
      | undefined;
    if (status && !SearchStatuses.includes(status)) {
      throw new HttpError({
        status: 400,
        message: "'status' must be one of [" + SearchStatuses + ']',
      });
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
      throw clientResponseToHttpError(userSearch);
    }

    response.status(200).json(toSearchResults(userSearch.result));
  };
}

export function sendVerificationEmail(auth0Client: Auth0Client) {
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);

    const userGet: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
      userId
    );
    if (userGet.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(userGet);
    }

    if (userGet.result.emailValidated) {
      response.status(304).json(toMessage('Email address already validated'));
      return;
    }

    const sendVerification: APIResponse<{}> = await auth0Client.sendVerificationEmail(
      userId
    );
    if (sendVerification.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(sendVerification);
    }

    response.sendStatus(200);
  };
}

export function sendPasswordResetEmail(auth0Client: Auth0Client) {
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);

    const userGet: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
      userId
    );
    if (userGet.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(userGet);
    }

    const sendPasswordReset: APIResponse<{}> = await auth0Client.sendPasswordResetEmail(
      userGet.result.email
    );
    if (sendPasswordReset.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(sendPasswordReset);
    }

    response.sendStatus(200);
  };
}

export function requestDelete(
  auth0Client: Auth0Client,
  emailClient: EmailClient
) {
  const checkPassword = passwordCheckerForUser(auth0Client);
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);
    const password: string = request.body.password;

    const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
      userId
    );
    if (auth0Get.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Get);
    }

    await checkPassword(
      auth0Get.result.email,
      password,
      extractSourceIp(request)
    );

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
      throw clientResponseToHttpError(emailDeleteAdmin);
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
  };
}

export function removeDelete(
  auth0Client: Auth0Client,
  emailClient: EmailClient
) {
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);

    const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
      userId
    );
    if (auth0Get.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Get);
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
      throw clientResponseToHttpError(auth0Update);
    }

    const auth0Unblock: APIResponse<{}> = await auth0Client.unblockAccount(
      userId
    );
    if (auth0Unblock.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Unblock);
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
  };
}

export function lockUser(auth0Client: Auth0Client) {
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);

    const blockUser: APIResponse<{}> = await auth0Client.blockAccount(userId);
    if (blockUser.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(blockUser);
    }

    response.sendStatus(200);
  };
}

export function removeUserLock(auth0Client: Auth0Client) {
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);

    const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(
      userId
    );
    if (auth0Get.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Get);
    }

    if (!auth0Get.result.locked) {
      response.status(304).json(toMessage('User is not locked'));
      return;
    }

    const unblockUser: APIResponse<{}> = await auth0Client.unblockAccount(
      userId
    );
    if (unblockUser.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(unblockUser);
    }

    response.sendStatus(204);
  };
}

export function deleteUser(
  sierraClient: SierraClient,
  auth0Client: Auth0Client
) {
  return async function (request: Request, response: Response): Promise<void> {
    const userId = getTargetUserId(request);

    const auth0Delete: APIResponse<{}> = await auth0Client.deleteUser(userId);
    if (auth0Delete.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Delete);
    }

    const patronDelete: APIResponse<{}> = await sierraClient.deletePatronRecord(
      userId
    );
    if (patronDelete.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(patronDelete);
    }

    response.sendStatus(204);
  };
}

function extractSourceIp(request: Request): string {
  if (!request.apiGateway) {
    throw new HttpError({
      status: 404,
      message: "API Gateway event and context data doesn't exist on request",
    });
  }
  return request.apiGateway?.event.requestContext.identity.sourceIp;
}

function getTargetUserId(request: Request): number {
  if (request.params.user_id === 'me') {
    if (userIsAdmin(request)) {
      throw new HttpError({
        status: 403,
        message: 'Administrator users cannot operate on themselves',
      });
    }

    const callerId: number = Number(
      request.apiGateway?.event.requestContext.authorizer?.callerId
    );
    if (isNaN(callerId)) {
      throw new HttpError({
        status: 401,
        message: `Caller attempted to operate on themselves, but request was not authorised`,
      });
    }

    return callerId;
  }

  const targetUserId: number = Number(request.params.user_id);
  if (isNaN(targetUserId)) {
    throw new HttpError({
      status: 400,
      message: `Invalid user ID [${targetUserId}]`,
    });
  }

  return targetUserId;
}

function userIsAdmin(request: Request): boolean {
  const isAdmin: string | null | undefined =
    request.apiGateway?.event.requestContext.authorizer?.isAdmin;
  return !!isAdmin && /true/i.test(isAdmin);
}

function passwordCheckerForUser(auth0Client: Auth0Client) {
  return async function (
    email: string,
    password: string,
    sourceIp: string
  ): Promise<void> {
    const validationResult = await auth0Client.validateUserCredentials(
      sourceIp,
      email,
      password
    );
    if (validationResult.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(validationResult);
    }
  };
}
