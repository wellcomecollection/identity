import supertest = require('supertest');
import { MockSierraClient } from '@weco/sierra-client';
import { MockAuth0Client } from '@weco/auth0-client';
import MockEmailClient from './MockEmailClient';
import { createApplication } from '../../../src/app';
import { Request } from 'supertest';

export type ExistingUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  onlyInSierra?: boolean;
  isAdmin?: boolean;
  markedForDeletion?: boolean;
  emailValidated?: boolean;
};

// See https://github.com/vendia/serverless-express/issues/182#issuecomment-609505645
export const asAdmin = (request: Request): Request => {
  const headerValue = encodeURIComponent(
    JSON.stringify({ requestContext: { authorizer: { isAdmin: true } } })
  );
  return request
    .set('x-apigateway-event', headerValue)
    .set('x-apigateway-context', headerValue);
};

export const mockedApi = (existingUsers: ExistingUser[] = []) => {
  const mockClients = {
    sierra: new MockSierraClient(),
    auth0: new MockAuth0Client(),
    email: new MockEmailClient(),
  };

  for (const user of existingUsers) {
    const { barcode } = MockSierraClient.randomPatronRecord();
    mockClients.sierra.addPatron(
      {
        barcode,
        recordNumber: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      user.password
    );

    if (!user.onlyInSierra) {
      mockClients.auth0.addUser({
        userId: user.userId.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.firstName + ' ' + user.lastName,
        additionalAttributes: {
          is_admin: user.isAdmin,
          deleteRequested: user.markedForDeletion
            ? new Date().toISOString()
            : undefined,
        },
      });

      if (user.emailValidated) {
        mockClients.auth0.markVerified(user.userId);
      }
    }
  }

  const app = createApplication(mockClients);
  return { api: supertest(app), clients: mockClients };
};
