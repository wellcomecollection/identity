import { Auth0Client, Auth0Profile } from '@weco/auth0-client';
import { APIResponse, isNonBlank, ResponseStatus } from '@weco/identity-common';
import { PatronRecord, SierraClient } from '@weco/sierra-client';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import { clientResponseToHttpError, HttpError } from '../models/HttpError';
import { toUser } from '../models/user';
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

    // TODO this is only required for the barcode, hopefully we can remove it
    const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByRecordNumber(
      userId
    );
    if (sierraGet.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(sierraGet);
    }

    if (!password) {
      throw new HttpError({
        status: 400,
        message: 'Current password must be provided',
      });
    }

    await checkPassword(auth0Profile.email, password, extractSourceIp(request));

    const newEmail = request.body.email;
    if (!newEmail || newEmail === auth0Profile.email) {
      response.sendStatus(304);
      return;
    }

    const auth0Update: APIResponse<Auth0Profile> = await auth0Client.updateUser(
      userId,
      newEmail
    );
    if (auth0Update.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Update);
    }

    response.status(200).json(toUser(auth0Update.result, sierraGet.result));
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
  const callerId: number = Number(
    request.apiGateway?.event.requestContext.authorizer?.callerId
  );

  if (isNaN(callerId)) {
    throw new HttpError({
      status: 401,
      message: `Request was not authorised`,
    });
  }

  const paramUserId = request.params.user_id;
  if (paramUserId !== 'me' && Number(paramUserId) !== callerId) {
    throw new HttpError({
      status: 403,
      message: `Caller cannot operate on resource`,
    });
  }

  return callerId;
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
