import crypto from 'crypto';
import { rest, RestRequest } from 'msw';
import { setupServer } from 'msw/node';
import { barcode, email, pin, recordMarc } from './test-patron';

let accessToken: string;
const createAccessToken = () => {
  accessToken = crypto.randomBytes(20).toString('hex');
  return accessToken;
};

const hasCurrentToken = (req: RestRequest): boolean =>
  req.headers.get('Authorization') === `Bearer ${accessToken}`;

export const apiRoot = 'http://sierra.test';

export const routeUrls = {
  token: `${apiRoot}/token`,
  credentials: `${apiRoot}/v6/patrons/auth`,
  patron: `${apiRoot}/v6/patrons/:patronId`,
  find: `${apiRoot}/v6/patrons/find`,
  patrons: `${apiRoot}/v6/patrons`,
};

const handlers = [
  rest.post(routeUrls.token, (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: createAccessToken(),
        expires_in: 3600,
        token_type: 'bearer',
      })
    );
  }),
  rest.post<{ patronId: string; patronSecret: string }>(
    routeUrls.credentials,
    (req, res, ctx) => {
      if (!hasCurrentToken(req)) {
        return res(ctx.status(401));
      }
      if (req.body.patronId === barcode && req.body.patronSecret === pin) {
        return res(ctx.status(200));
      }
      return res(ctx.status(400));
    }
  ),
  rest.get(routeUrls.patron, (req, res, ctx) => {
    if (!hasCurrentToken(req)) {
      return res(ctx.status(401));
    }
    const fields = [
      'id',
      ...(req.url.searchParams.get('fields')?.split(',') || []),
    ];
    const response = Object.fromEntries(
      fields.map((field) => [field, recordMarc[field]])
    );
    return res(ctx.json(response));
  }),
  rest.get(routeUrls.patrons, (req, res, ctx) => {
    return res(ctx.status(404));
  }),
  rest.put(routeUrls.patron, (req, res, ctx) => {
    if (!hasCurrentToken(req)) {
      return res(ctx.status(401));
    }
    return res(ctx.status(204));
  }),
  rest.get(routeUrls.find, (req, res, ctx) => {
    if (!hasCurrentToken(req)) {
      return res(ctx.status(401));
    }
    if (
      req.url.searchParams.get('varFieldTag') === 'z' &&
      req.url.searchParams.get('varFieldContent') === email
    ) {
      return res(ctx.json(recordMarc));
    }
  }),
];

export default setupServer(...handlers);
