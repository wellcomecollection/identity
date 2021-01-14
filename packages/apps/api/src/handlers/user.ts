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
  }

  const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByRecordNumber(userId);
  if (sierraGet.status === ResponseStatus.Success) {
    const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByUserId(userId);
    if (auth0Get.status === ResponseStatus.Success) {
      response.status(200).json(toUser(sierraGet.result, auth0Get.result));
    } else if (auth0Get.status === ResponseStatus.NotFound) {
      response.status(404).json(toMessage(auth0Get.message));
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }
  } else if (sierraGet.status === ResponseStatus.NotFound) {
    response.status(404).json(toMessage(sierraGet.message));
  } else {
    response.status(500).json(toMessage(sierraGet.message));
  }
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

  response.status(204);
}

export async function createUser(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const firstName: string = request.body.firstName;
  const lastName: string = request.body.lastName;
  const email: string = request.body.email;
  const password: string = request.body.password;

  if (!isNonBlank(firstName) || !isNonBlank(lastName) || !isNonBlank(email) || !isNonBlank(password)) {
    response.status(400).json(toMessage("All fields must be provided and non-blank"));
  }

  // Check if there's already a record in Sierra for the given email address
  const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByEmail(email);
  if (sierraGet.status === ResponseStatus.NotFound) {

    // Check if there's a user in Auth0 for the given email address
    const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByEmail(email);
    if (auth0Get.status === ResponseStatus.NotFound) {

      // At this point the given email address isn't in use in Patron or Auth0, so create a new "barebones" Patron
      // record for the user - this is a record which doesn't have an email address or barcode associated with it. When
      // we set the Sierra password, we truncate it to 31 characters if necessary - Sierra will return an error if the
      // password is greater than 31 characters.
      const sierraCreate: APIResponse<number> = await sierraClient.createPatronRecord(firstName, lastName, truncate(password, 30));
      if (sierraCreate.status === ResponseStatus.Success) {

        // Create the corresponding Auth0 user, using the Patron record number from the previous step as the user ID.
        // Note that there's no limitation on password length here - Auth0 will accept any password length, but they use
        // bcrypt under the hood and thus only the first 72 characters are actually used to store / compare passwords.
        const auth0Create: APIResponse<Auth0Profile> = await auth0Client.createUser(sierraCreate.result, email, password);
        if (auth0Create.status === ResponseStatus.Success) {

          // Finally, apply the email address and barcode to the Patron record. If we did this at the same time as we
          // created, then the creation of the Auth0 user would have failed as the Auth0 action scripts will call out to
          // Sierra to check if the given email is unique.
          const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePatronPostCreationFields(sierraCreate.result, email);

          // Everything went fine, return the newly created user along with a 201 to the caller.
          if (sierraUpdate.status === ResponseStatus.Success) {
            response.status(201).json(toUser(sierraUpdate.result, auth0Create.result));

            // The request to update the Patron record was malformed.
          } else if (sierraUpdate.status === ResponseStatus.MalformedRequest) {
            response.status(400).json(toMessage(sierraUpdate.message));

            // An unhandled error occurred trying to update the Patron record.
          } else {
            response.status(500).json(toMessage(sierraUpdate.message));
          }
        } else {

          // An error occurred creating the linked Auth0 user, so delete the corresponding Patron record. This isn't
          // exactly necessary, but prevent junk data from building up in Sierra - as such, we don't really care if it
          // fails. After we do this, we return a more specific error response to the caller indicating what went wrong.
          await sierraClient.deletePatronRecord(sierraCreate.result);

          // The request to create the Auth0 user was malformed.
          if (auth0Create.status === ResponseStatus.MalformedRequest) {
            response.status(400).json(toMessage(auth0Create.message));

            // The request to create the Auth0 user failed because the email address is already in use. This should
            // never happen, since we check for the existence of an Auth0 user with the same email before we get this
            // far.
          } else if (auth0Create.status === ResponseStatus.UserAlreadyExists) {
            response.status(409).json(toMessage(auth0Create.message));

            // The given password did not meet the configured Auth0 password policy.
          } else if (auth0Create.status === ResponseStatus.PasswordTooWeak) {
            response.status(422).json(toMessage(auth0Create.message));

            // An unhandled error occurred trying to update the Patron record.
          } else {
            response.status(500).json(toMessage(auth0Create.message));
          }
        }

        // The request to create the Patron record was malformed.
      } else if (sierraCreate.status === ResponseStatus.MalformedRequest) {
        response.status(400).json(toMessage(sierraCreate.message));

        // The given password did not meet the configured Sierra password policy.
      } else if (sierraCreate.status === ResponseStatus.PasswordTooWeak) {
        response.status(422).json(toMessage(sierraCreate.message));

        // An unhandled error occurred trying to create the Patron record.
      } else {
        response.status(500).json(toMessage(sierraCreate.message));
      }

      // An Auth0 user with the given email address already exists, so return a '409 Conflict' to the caller indicating
      // the same.
    } else if (auth0Get.status === ResponseStatus.Success) {
      response.status(409).json(toMessage('Auth0 user with email [' + email + '] already exists'));

      // An unhandled error occurred checking if an Auth0 user with the given email address already exists.
    } else {
      response.status(500).json(toMessage(auth0Get.message));
    }

    // A Patron record with the given email address already exists, so return a '409 Conflict' to the caller indicating
    // the same.
  } else if (sierraGet.status === ResponseStatus.Success) {
    response.status(409).json(toMessage('Patron record with email [' + email + '] already exists'));

    // An unhandled error occurred checking if a Patron record with the given email address already exists.
  } else {
    response.status(500).json(toMessage(sierraGet.message));
  }
}

export async function updateUser(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {

  const userId: number = Number(request.params.user_id);
  if (isNaN(userId)) {
    response.status(400).json(toMessage('Invalid user ID [' + userId + ']'));
  }
  const email: string = request.body.email;

  if (!isNonBlank(email)) {
    response.status(400).json(toMessage("All fields must be provided and non-blank"));
  }

  const auth0Get: APIResponse<Auth0Profile> = await auth0Client.getUserByEmail(email);
  if (auth0Get.status === ResponseStatus.NotFound) {
    const sierraGet: APIResponse<PatronRecord> = await sierraClient.getPatronRecordByEmail(email);
    if (sierraGet.status === ResponseStatus.NotFound) {
      const auth0Update: APIResponse<Auth0Profile> = await auth0Client.updateUser(userId, email);
      if (auth0Update.status === ResponseStatus.Success) {
        const sierraUpdate: APIResponse<PatronRecord> = await sierraClient.updatePatronRecord(userId, email);
        if (sierraUpdate.status === ResponseStatus.Success) {
          response.status(200).json(toUser(sierraUpdate.result, auth0Update.result));
        } else if (sierraUpdate.status === ResponseStatus.NotFound) {
          response.status(404).json(toMessage(sierraUpdate.message));
        } else if (sierraUpdate.status === ResponseStatus.MalformedRequest) {
          response.status(400).json(toMessage(sierraUpdate.message));
        } else {
          response.status(500).json(toMessage(sierraUpdate.message));
        }
      } else if (auth0Update.status === ResponseStatus.NotFound) {
        response.status(404).json(toMessage(auth0Update.message));
      } else if (auth0Update.status === ResponseStatus.UserAlreadyExists) {
        response.status(409).json(toMessage(auth0Update.message));
      } else if (auth0Update.status === ResponseStatus.MalformedRequest) {
        response.status(400).json(toMessage(auth0Update.message));
      } else {
        response.status(500).json(toMessage(auth0Update.message));
      }
    } else if (sierraGet.status === ResponseStatus.Success) {
      response.status(409).json(toMessage('Patron record with email [' + email + '] already exists'));
    } else {
      response.status(500).json(toMessage(sierraGet.message));
    }
  } else if (auth0Get.status === ResponseStatus.Success) {
    response.status(409).json(toMessage('Auth0 user with email [' + email + '] already exists'));
  } else {
    response.status(500).json(toMessage(auth0Get.message));
  }
}
