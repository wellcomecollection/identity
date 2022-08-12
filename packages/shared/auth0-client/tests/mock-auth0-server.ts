import jwt from 'jsonwebtoken';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';
import { setupServer } from 'msw/node';
import { Auth0User } from '@weco/auth0-client';
import { testUser } from './test-user';

let accessToken: string;
const createAccessToken = (expiresIn?: string) => {
  accessToken = jwt.sign(
    { importantInformation: Math.random() },
    'test-secret-key',
    { expiresIn }
  );
  return accessToken;
};

const hasCurrentToken = (req: RestRequest): boolean =>
  req.headers.get('Authorization') === `Bearer ${accessToken}`;

export const resolveUser =
  (user: Auth0User): ResponseResolver<RestRequest, RestContext> =>
  (req, res, ctx) => {
    if (!hasCurrentToken(req)) {
      return res(ctx.status(401));
    }
    return res(ctx.json(user));
  };

export const apiRoot = 'http://auth0.test';

export const routeUrls = {
  token: `${apiRoot}/oauth/token`,
  user: `${apiRoot}/api/v2/users/:userId`,
  resendVerificationEmail: `${apiRoot}/api/v2/jobs/verification-email`,
};

const handlers = [
  rest.post(routeUrls.token, (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: createAccessToken('1h'),
      })
    );
  }),
  rest.get(routeUrls.user, resolveUser(testUser)),
  rest.delete(routeUrls.user, (req, res, ctx) => res(ctx.status(204))),
  rest.post(routeUrls.resendVerificationEmail, (req, res, ctx) => {
    if (!hasCurrentToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.status(201));
  }),
  rest.patch(routeUrls.user, (req, res, ctx) => {
    if (!hasCurrentToken(req)) {
      return res(ctx.status(401));
    }
    return res(
      ctx.json({
        ...testUser,
        email:
          typeof req.body === 'object' &&
          req.body !== null &&
          'email' in req.body
            ? req.body.email
            : testUser.email,
      })
    );
  }),
];

export default setupServer(...handlers);
