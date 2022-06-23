import { callbackify } from 'util';
import { ResponseStatus } from '@weco/identity-common';
import { HttpSierraClient } from '@weco/sierra-client';
import { Auth0UserWithPassword } from '@weco/auth0-client/src/auth0';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

const userAlreadyExistsMessage =
  'A user with this email address already exists.';

async function create(user: Auth0UserWithPassword) {
  // We need to create the patron in sierra, we will update the patron info with firstName, lastName etc
  // when we get this information from the full registration form
  console.log('CREATE FUNCTION BEGINS');

  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  const tempFirstName = `Auth0_Registration_${user.user_id}`;
  const tempLastName = 'Auth0_Registration_tempLastName';

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
    console.log('CREATE PATRON IN SIERRA ERRORS - USER ALREADY EXISTS');
    throw new ValidationError(user.email, userAlreadyExistsMessage);
  }
  if (createPatronResponse.status !== ResponseStatus.Success) {
    console.log('CREATE PATRON IN SIERRA ERRORS');
    throw new Error(createPatronResponse.message);
  }

  // We now need to find the patron we created and eventually update their barcode
  const findPatronResponse = await sierraClient.getPatronRecordByEmail(
    user.email
  );
  if (findPatronResponse.status !== ResponseStatus.Success) {
    console.log('FIND PATRON BARCODE - NOT SUCCESSFUL');
    throw new Error(findPatronResponse.message);
  }
  const { recordNumber } = findPatronResponse.result;

  // Now we update the patron record with a barcode based on the recordNumber
  // We make the recordNumber (patron id) the barcode, sierra expects barcode to be a string
  const updatePatronBarcodeResponse = await sierraClient.updatePatron(
    recordNumber,
    { barcodes: [recordNumber.toString()] }
  );
  if (updatePatronBarcodeResponse.status !== ResponseStatus.Success) {
    console.log('UPDATE PATRON BARCODE NOT SUCCESSFUL');
    throw new Error(updatePatronBarcodeResponse.message);
  }
}

export default callbackify(create);
