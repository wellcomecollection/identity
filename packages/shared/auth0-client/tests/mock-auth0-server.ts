import jwt from 'jsonwebtoken';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';
import { setupServer } from 'msw/node';
import { Auth0User } from '@weco/auth0-client';
import { testUser } from './test-user';

const createAccessToken = (expiresIn?: string) =>
  jwt.sign({}, 'test-secret-key', { expiresIn });

export const resolveUser = (
  user: Auth0User
): ResponseResolver<RestRequest, RestContext> => (req, res, ctx) => {
  return res(ctx.json(user));
};

export const apiRoot = 'http://auth0.test';

export const routeUrls = {
  token: `${apiRoot}/oauth/token`,
  user: `${apiRoot}/api/v2/users/:userId`,
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
  rest.patch(routeUrls.user, (req, res, ctx) => {
    return res(
      ctx.json({
        ...testUser,
        email:
          typeof req.body === 'object' && 'email' in req.body
            ? req.body.email
            : testUser.email,
      })
    );
  }),
];

export default setupServer(...handlers);
