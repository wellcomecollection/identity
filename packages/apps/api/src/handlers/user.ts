import { Auth0Client, Auth0User } from '@weco/auth0-client';
import { APIResponse, isNonBlank, ResponseStatus } from '@weco/identity-common';
import { Request, Response } from 'express';
import { toMessage } from '../models/common';
import { clientResponseToHttpError, HttpError } from '../models/HttpError';
import { toUser } from '../models/user';
import { EmailClient } from '../utils/EmailClient';
import { SierraClient, varFieldTags } from '@weco/sierra-client';

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
    const auth0Get: APIResponse<Auth0User> = await auth0Client.getUserByUserId(
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

export function getUser(auth0Client: Auth0Client) {
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);
    const auth0Get: APIResponse<Auth0User> = await auth0Client.getUserByUserId(
      userId
    );
    if (auth0Get.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Get);
    }

    response.status(200).json(toUser(auth0Get.result));
  };
}

export function updateUserAfterRegistration(sierraClient: SierraClient) {
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);
    const firstName: string = request.body.firstName;
    const lastName: string = request.body.lastName;

    // This is a very powerful endpoint, and we don't want it to be misused
    // to overwrite the first/last name of existing patrons.
    //
    // We retrieve the existing patron record and check it has the placeholder
    // values we store for a user when they're created; if not, we reject the
    // request because something has gone wrong.
    const getPatronResponse = await sierraClient.getPatronRecordByRecordNumber(
      userId
    );

    if (getPatronResponse.status === ResponseStatus.NotFound) {
      throw new HttpError({
        status: 404,
        message: 'User does not exist',
      });
    }

    if (getPatronResponse.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(getPatronResponse);
    }

    // If somebody comes through this flow and enters the same name as the existing
    // patron record, we treat it as okay.
    //
    // This makes the endpoint idempotent, and guards against annoying errors,
    // e.g. if the identity web app sends the PUT request twice.
    if (
      getPatronResponse.result.firstName === firstName &&
      getPatronResponse.result.lastName === lastName
    ) {
      response.sendStatus(204);
      return;
    }

    // If somebody comes through this flow and the name in Sierra isn't our placeholder,
    // then shenanigans might be occurring. Throw an error; a human needs to look at this.
    if (
      getPatronResponse.result.firstName !== 'Auth0_Registration_undefined' ||
      getPatronResponse.result.lastName !== 'Auth0_Registration_tempLastName'
    ) {
      throw new HttpError({
        status: 409,
        message: `User ${userId} is already registered in Sierra.`,
      });
    }

    // Update the patron record with the incoming full registration first and lastname
    //
    // Note: we only update the patron record in Sierra, not Auth0, because you
    // can't update the name of Auth0 with our setup.  If you try, you get an error:
    //
    //    The following user attributes cannot be updated: family_name, given_name, name.
    //    The connection (Sierra-Connection) must either be a database connection (using
    //    the Auth0 store), a passwordless connection (email or sms) or has disabled
    //    'Sync user profile attributes at each login'.
    //
    //    For more information, see
    //    https://auth0.com/docs/dashboard/guides/connections/configure-connection-sync
    //
    // Because patron data is only refreshed every time a user authenticates, we instead
    // log the user out after they complete the sign-up process.  When they log back in,
    // Auth0 will re-fetch their profile data from Sierra.
    const updatePatronResponse = await sierraClient.updatePatron(userId, {
      varFields: [
        {
          fieldTag: varFieldTags.name,
          subfields: [
            // The trailing comma allows the MARC values to be concatenated into one string:
            //
            //         Smith, |cDr |bJane
            //      => Smith, Dr Jane
            //
            // This also mirrors patron records that were created in the previous system.
            {
              tag: 'a',
              content: `${lastName},`,
            },
            {
              tag: 'b',
              content: firstName,
            },
          ],
        },
      ],
    });
    if (updatePatronResponse.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(updatePatronResponse);
    }

    response.sendStatus(204);
  };
}

export function updateUser(auth0Client: Auth0Client) {
  const checkPassword = passwordCheckerForUser(auth0Client);
  return async function (request: Request, response: Response): Promise<void> {
    const userId: number = getTargetUserId(request);
    const password: string | undefined = request.body.password;

    const auth0UserIdGet: APIResponse<Auth0User> =
      await auth0Client.getUserByUserId(userId);
    if (auth0UserIdGet.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0UserIdGet);
    }
    const auth0Profile: Auth0User = auth0UserIdGet.result;

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

    const auth0Update: APIResponse<Auth0User> = await auth0Client.updateUser({
      userId,
      email: newEmail,
    });
    if (auth0Update.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(auth0Update);
    }

    response.status(200).json(toUser(auth0Update.result));
  };
}

export function changePassword(auth0Client: Auth0Client) {
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

    const auth0Get: APIResponse<Auth0User> = await auth0Client.getUserByUserId(
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

    const auth0Update: APIResponse<Auth0User> =
      await auth0Client.updatePassword(userId, newPassword);
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

    const auth0Get: APIResponse<Auth0User> = await auth0Client.getUserByUserId(
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

    if (auth0Get.result?.app_metadata?.deleteRequested) {
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

    const emailDeleteAdmin: APIResponse<{}> =
      await emailClient.sendDeleteRequestAdmin(auth0Get.result);
    if (emailDeleteAdmin.status !== ResponseStatus.Success) {
      throw clientResponseToHttpError(emailDeleteAdmin);
    }

    const auth0Update: APIResponse<{}> = await auth0Client.setAppMetadata(
      userId,
      {
        // I believe the type assertion (!) is correct but putting the fallback here for safety
        ...(auth0Get.result.app_metadata! || {}),
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

    const emailDeleteUser: APIResponse<{}> =
      await emailClient.sendDeleteRequestUser(auth0Get.result);
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

export const validateUserId = ({
  callerId,
  paramUserId,
}: {
  callerId: string;
  paramUserId: string;
}): number => {
  if (paramUserId !== 'me' && isNaN(Number(paramUserId))) {
    throw new HttpError({
      status: 401,
      message: 'Request was not authorised',
    });
  }

  // In the api-authorizer, if we get a request from a machine-to-machine flow,
  // the caller ID will be set to `@machine`.
  if (callerId === '@machine' && paramUserId !== 'me') {
    return Number(paramUserId);
  }

  if (isNaN(Number(callerId))) {
    throw new HttpError({
      status: 401,
      message: 'Request was not authorised',
    });
  }

  if (paramUserId !== 'me' && Number(paramUserId) !== Number(callerId)) {
    throw new HttpError({
      status: 403,
      message: 'Caller cannot operate on resource',
    });
  }

  return Number(callerId);
};

function getTargetUserId(request: Request): number {
  const callerId =
    request.apiGateway?.event.requestContext.authorizer?.callerId;

  const paramUserId = request.params.user_id;

  return validateUserId({ callerId, paramUserId });
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
