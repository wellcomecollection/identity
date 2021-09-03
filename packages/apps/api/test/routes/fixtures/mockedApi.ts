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
  isAdmin?: boolean;
  markedForDeletion?: boolean;
  emailValidated?: boolean;
};

// See https://github.com/vendia/serverless-express/issues/182#issuecomment-609505645
const withApiGatewayContext = (data: object) => (request: Request) => {
  const headerValue = encodeURIComponent(
    JSON.stringify({ requestContext: data })
  );
  return request
    .set('x-apigateway-event', headerValue)
    .set('x-apigateway-context', headerValue);
};

export const asAdmin = withApiGatewayContext({ authorizer: { isAdmin: true } });
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
            is_admin: user.isAdmin,
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
  return { api: supertest(app), clients: mockClients };
};
