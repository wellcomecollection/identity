import { callbackify } from 'util';
import {
  ResponseStatus,
  REGISTRATION_NAME_PREFIX,
} from '@weco/identity-common';
import { HttpSierraClient } from '@weco/sierra-client';
import { Auth0UserWithPassword } from '@weco/auth0-client/src/auth0';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

const userAlreadyExistsMessage =
  'A user with this email address already exists.';

const tempFirstName = `${REGISTRATION_NAME_PREFIX}_tempFirstName`;
const tempLastName = `${REGISTRATION_NAME_PREFIX}_tempLastName`;

async function create(user: Auth0UserWithPassword) {
  // We need to create the patron in sierra, we will update the patron info with firstName, lastName etc
  // when we get this information from the full registration form
  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const sierraClient = new HttpSierraClient(apiRoot, clientKey, clientSecret);

  const createPatronResponse = await sierraClient.createPatron(
    // We temporarily set a first and lastName that is easier to find that way we
    // can delete users that don't finish the full registration process
    tempLastName,
    tempFirstName,
    user.email,
    user.password
  );

  if (createPatronResponse.status === ResponseStatus.UserAlreadyExists) {
    // https://auth0.com/docs/authenticate/database-connections/custom-db/templates/create#return-error-that-user-already-exists
    throw new ValidationError('user_exists', userAlreadyExistsMessage);
  }

  if (createPatronResponse.status !== ResponseStatus.Success) {
    // This is to handle cases where we get an error from Sierra because it
    // applies its own password complexity rules.
    //
    // This error message is shown directly to users -- it gives them a more
    // helpful error than 'Something went wrong, please try again later'.
    if (
      createPatronResponse.message ===
      'Malformed or invalid Patron creation request ' +
        '(cause: [{"code":136,"specificCode":6,"httpStatus":400,"name":"PIN is not valid","description":"PIN is not valid : PIN is trivial"}])'
    ) {
      throw new ValidationError(
        user.email,
        'Please use a more complex password.'
      );
    } else if (
      createPatronResponse.message ===
      'Malformed or invalid Patron creation request ' +
        '(cause: [{"code":136,"specificCode":3,"httpStatus":400,"name":"PIN is not valid","description":"PIN is not valid : PIN too long"}])'
    ) {
      throw new ValidationError(user.email, 'Please use a shorter password.');
    } else {
      throw new Error(createPatronResponse.message);
    }
  }

  // Now we update the patron record with a barcode based on the recordNumber
  // We make the recordNumber (patron id) the barcode, sierra expects barcode to be a string
  const recordNumber = createPatronResponse.result.recordNumber;
  const updatePatronBarcodeResponse = await sierraClient.updatePatron(
    recordNumber,
    { barcodes: [recordNumber.toString()] }
  );
  if (updatePatronBarcodeResponse.status !== ResponseStatus.Success) {
    throw new Error(updatePatronBarcodeResponse.message);
  }
}

export default callbackify(create);
