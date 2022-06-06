import supertest = require('supertest');
import { MockAuth0Client } from '@weco/auth0-client';
import { MockSierraClient } from '@weco/sierra-client';
import MockEmailClient from './MockEmailClient';
import { createApplication } from '../../../src/app';
import { Request } from 'supertest';

export type ExistingUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  markedForDeletion?: boolean;
  emailValidated?: boolean;
  role?: string;
};

const apiGatewayHeaders = (data: object = {}) => {
  const value = encodeURIComponent(JSON.stringify({ requestContext: data }));
  return {
    'x-apigateway-event': value,
    'x-apigateway-context': value,
  };
};

// See https://github.com/vendia/serverless-express/issues/182#issuecomment-609505645
const withApiGatewayContext = (data: object) => (request: Request) =>
  request.set(apiGatewayHeaders(data));

export const withCallerId = (id: string | number) =>
  withApiGatewayContext({
    authorizer: { callerId: id },
    identity: { sourceIp: 'test' },
  });

export const mockedApi = (existingUsers: ExistingUser[] = []) => {
  const mockClients = {
    auth0: new MockAuth0Client(),
    email: new MockEmailClient(),
    sierra: new MockSierraClient(),
  };

  for (const user of existingUsers) {
    mockClients.auth0.addUser(
      {
        user_id: user.userId.toString(),
        email: user.email,
        given_name: user.firstName,
        family_name: user.lastName,
        name: user.firstName + ' ' + user.lastName,
        app_metadata: {
          deleteRequested: user.markedForDeletion
            ? new Date().toISOString()
            : undefined,
          barcode: Math.floor(Math.random() * 1e8).toString(),
          role: user.role ?? 'Reader',
        },
      },
      user.password
    );

    if (user.emailValidated) {
      mockClients.auth0.markVerified(user.userId);
    }
  }

  const app = createApplication(mockClients);

  const api = supertest.agent(app);
  api.set(apiGatewayHeaders());

  return { api, clients: mockClients };
};
