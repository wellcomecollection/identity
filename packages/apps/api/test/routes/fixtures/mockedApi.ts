import supertest = require('supertest');
import { MockSierraClient } from '@weco/sierra-client';
import { MockAuth0Client } from '@weco/auth0-client';
import MockEmailClient from './MockEmailClient';
import { createApplication } from '../../../src/app';
import { Request } from 'supertest';

type SourceSystem = 'sierra' | 'auth0';

export type ExistingUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  sourceSystems: SourceSystem[];
  password?: string;
  markedForDeletion?: boolean;
  emailValidated?: boolean;
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

export const withSourceIp = withApiGatewayContext({
  identity: { sourceIp: 'test' },
});

export const mockedApi = (existingUsers: ExistingUser[] = []) => {
  const mockClients = {
    sierra: new MockSierraClient(),
    auth0: new MockAuth0Client(),
    email: new MockEmailClient(),
  };

  for (const user of existingUsers) {
    if (user.sourceSystems.includes('auth0')) {
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
    }

    if (user.sourceSystems.includes('sierra')) {
      mockClients.auth0.addUser(
        {
          userId: user.userId.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.firstName + ' ' + user.lastName,
          additionalAttributes: {
            deleteRequested: user.markedForDeletion
              ? new Date().toISOString()
              : undefined,
          },
        },
        user.password
      );

      if (user.emailValidated) {
        mockClients.auth0.markVerified(user.userId);
      }
    }
  }

  const app = createApplication(mockClients);

  const api = supertest.agent(app);
  api.set(apiGatewayHeaders());

  return { api, clients: mockClients };
};
