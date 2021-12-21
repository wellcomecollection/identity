import crypto from 'crypto';
import { DefaultRequestBody, rest } from 'msw';
import { setupServer } from 'msw/node';
import { barcode, email, pin, recordMarc } from './test-patron';

const createAccessToken = () => crypto.randomBytes(20).toString('hex');

export const apiRoot = 'http://sierra.test';

export const routeUrls = {
  token: `${apiRoot}/token`,
  credentials: `${apiRoot}/v6/patrons/auth`,
  patron: `${apiRoot}/v6/patrons/:patronId`,
  find: `${apiRoot}/v6/patrons/find`,
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
      if (req.body.patronId === barcode && req.body.patronSecret === pin) {
        return res(ctx.status(200));
      }
      return res(ctx.status(400));
    }
  ),
  rest.get(routeUrls.patron, (req, res, ctx) => {
    return res(ctx.json(recordMarc));
  }),
  rest.put(routeUrls.patron, (req, res, ctx) => {
    return res(ctx.status(204));
  }),
  rest.get<
    DefaultRequestBody,
    { varFieldTag?: string; varFieldContent?: string; fields: string }
  >(routeUrls.find, (req, res, ctx) => {
    if (
      req.params.varFieldTag === 'z' &&
      req.params.varFieldContent === email
    ) {
      return res(ctx.json(recordMarc));
    }
  }),
];

export default setupServer(...handlers);
