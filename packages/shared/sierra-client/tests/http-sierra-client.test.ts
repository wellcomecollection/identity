import { ResponseStatus, SuccessResponse } from '@weco/identity-common';
import { PatronRecord, HttpSierraClient } from '../src';
import mockSierraServer, { apiRoot, routeUrls } from './mock-sierra-server';
import {
  barcode,
  email,
  firstName,
  lastName,
  pin,
  recordMarc,
  recordNonMarc,
  recordNumber,
  role,
  verifiedEmails,
} from './test-patron';
import { rest } from 'msw';
import { varFieldTags } from '../src/patron';

describe('HTTP sierra client', () => {
  const clientKey = 'abcdefghijklmnopqrstuvwxyz';
  const clientSecret = 'ABCDEFGHIJKLMNOPQRSTUVYWXYZ';
  const client = new HttpSierraClient(apiRoot, clientKey, clientSecret);

  beforeAll(() => mockSierraServer.listen());
  afterAll(() => mockSierraServer.close());
  afterEach(() => mockSierraServer.resetHandlers());

  describe('validate credentials', () => {
    it('validates correct credentials', async () => {
      const response = await client.validateCredentials(barcode, pin);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<{}>>response).result;
      expect(result).toEqual({});
    });

    it('fails on unexpected credentials', async () => {
      const response = await client.validateCredentials('wrong', 'wrong');
      expect(response.status).toBe(ResponseStatus.InvalidCredentials);
    });

    it('returns an UnknownError if the API errors', async () => {
      mockSierraServer.use(
        rest.post(routeUrls.credentials, (req, res, ctx) =>
          res(ctx.status(500))
        )
      );

      const response = await client.validateCredentials(barcode, pin);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('get patron record by record number', () => {
    it('gets a record where the name is not in MARC format', async () => {
      mockSierraServer.use(
        rest.get(routeUrls.patron, (req, res, ctx) =>
          res(ctx.json(recordNonMarc))
        )
      );

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      expect(result).toEqual({
        barcode,
        email,
        firstName,
        lastName,
        recordNumber,
        role,
        verifiedEmails,
      });
    });

    it('gets a record where the name is in MARC format', async () => {
      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      expect(result).toEqual({
        barcode,
        email,
        firstName,
        lastName,
        recordNumber,
        role,
        verifiedEmails,
      });
    });

    it('returns a NotFound for a patron record that exists but is deleted', async () => {
      mockSierraServer.use(
        rest.get(routeUrls.patron, (req, res, ctx) =>
          res(ctx.json({ ...recordMarc, deleted: true }))
        )
      );

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns a NotFound when the api returns a 404', async () => {
      mockSierraServer.use(
        rest.get(routeUrls.patron, (req, res, ctx) => res(ctx.status(404)))
      );

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an UnknownError when the api returns a 500', async () => {
      mockSierraServer.use(
        rest.get(routeUrls.patron, (req, res, ctx) => res(ctx.status(500)))
      );

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('get patron record by email', () => {
    it('finds a record where the name is not in MARC format', async () => {
      mockSierraServer.use(
        rest.get(routeUrls.find, (req, res, ctx) =>
          res(ctx.json(recordNonMarc))
        )
      );

      const response = await client.getPatronRecordByEmail(email);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      expect(result).toEqual({
        barcode,
        email,
        firstName,
        lastName,
        recordNumber,
        role,
        verifiedEmails,
      });
    });

    it('finds a record where the name is in MARC format', async () => {
      const response = await client.getPatronRecordByEmail(email);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      expect(result).toEqual({
        barcode,
        email,
        firstName,
        lastName,
        recordNumber,
        role,
        verifiedEmails,
      });
    });

    it('returns a NotFound when no record can be found', async () => {
      mockSierraServer.use(
        rest.get(routeUrls.find, (req, res, ctx) => res(ctx.status(404)))
      );

      const response = await client.getPatronRecordByEmail(email);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an UnknownError when the api returns a 500', async () => {
      mockSierraServer.use(
        rest.get(routeUrls.find, (req, res, ctx) => res(ctx.status(500)))
      );

      const response = await client.getPatronRecordByEmail(email);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('mark patron email verified', () => {
    it('adds a verification note for the current email', async () => {
      const response = await client.markPatronEmailVerified(recordNumber);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      expect(result).toEqual({
        barcode,
        email,
        firstName,
        lastName,
        recordNumber,
        role,
        verifiedEmails: [email],
      });
    });

    it('returns a NotFound if there is no user', async () => {
      mockSierraServer.use(
        rest.put(routeUrls.patron, (req, res, ctx) => res(ctx.status(404)))
      );

      const response = await client.markPatronEmailVerified(recordNumber);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });
  });

  describe('delete non-current verification notes', () => {
    it('removes verification notes for non-current emails', async () => {
      mockSierraServer.use(
        rest.get(routeUrls.patron, (req, res, ctx) =>
          res(
            ctx.json({
              ...recordMarc,
              varFields: [
                ...recordMarc.varFields,
                {
                  fieldTag: varFieldTags.notes,
                  content:
                    'Auth0: another@email.com verified at 2011-01-11T00:00:00.000Z',
                },
                {
                  fieldTag: varFieldTags.notes,
                  content: `Auth0: ${email} verified at 2011-01-11T00:00:00.000Z`,
                },
              ],
            })
          )
        )
      );

      const response = await client.deleteNonCurrentVerificationNotes(
        recordNumber
      );
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      expect(result).toEqual({
        barcode,
        email,
        firstName,
        lastName,
        recordNumber,
        role,
        verifiedEmails: [email],
      });
    });

    it('returns a NotFound if there is no user', async () => {
      mockSierraServer.use(
        rest.put(routeUrls.patron, (req, res, ctx) => res(ctx.status(404)))
      );

      const response = await client.deleteNonCurrentVerificationNotes(
        recordNumber
      );
      expect(response.status).toBe(ResponseStatus.NotFound);
    });
  });

  describe('update patron email', () => {
    it('updates the email', async () => {
      const response = await client.updatePatronEmail(recordNumber, email);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      expect(result).toEqual({
        barcode,
        email,
        firstName,
        lastName,
        recordNumber,
        role,
        verifiedEmails,
      });
    });

    it('handles malformed requests', async () => {
      mockSierraServer.use(
        rest.put(routeUrls.patron, (req, res, ctx) => res(ctx.status(400)))
      );

      const response = await client.updatePatronEmail(recordNumber, email);
      expect(response.status).toBe(ResponseStatus.MalformedRequest);
    });

    it('returns a NotFound if there is no user', async () => {
      mockSierraServer.use(
        rest.put(routeUrls.patron, (req, res, ctx) => res(ctx.status(404)))
      );

      const response = await client.updatePatronEmail(recordNumber, email);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an UnknownError when the api returns a 500', async () => {
      mockSierraServer.use(
        rest.put(routeUrls.patron, (req, res, ctx) => res(ctx.status(500)))
      );

      const response = await client.updatePatronEmail(recordNumber, email);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });
});
