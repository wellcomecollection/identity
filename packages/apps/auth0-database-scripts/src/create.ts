import { callbackify } from 'util';
import { Auth0User } from '@weco/auth0-client';
import { ResponseStatus } from '@weco/identity-common';
import { HttpSierraClient, SierraClient } from '@weco/sierra-client';

declare const configuration: {
  API_ROOT: string;
  CLIENT_KEY: string;
  CLIENT_SECRET: string;
};

const userAlreadyExistsMessage =
  'A user with this email address already exists.';

async function create(user: Auth0User) {
  // We need to create the patron in sierra, we will update the patron info with firstName, lastName etc
  // when we get this information from the full registration form

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
    // @ts-ignore
    user.password
  );
  if (createPatronResponse.status === ResponseStatus.UserAlreadyExists) {
    throw new ValidationError(user.email, userAlreadyExistsMessage);
  }
  if (createPatronResponse.status !== ResponseStatus.Success) {
    throw new Error(createPatronResponse.message);
  }
}

export default callbackify(create);
