import { ResponseStatus, SuccessResponse } from '@weco/identity-common';
import { PatronRecord, HttpSierraClient } from '../src';
import mockSierraServer, { apiRoot, routeUrls } from './mock-sierra-server';
import {
  barcode,
  createdDate,
  email,
  firstName,
  lastName,
  pin,
  recordMarc,
  recordNonMarc,
  recordNumber,
  role,
  verifiedEmail,
} from './test-patron';
import { rest } from 'msw';

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

  describe('create a patron', () => {
    const newPatron = {
      lastName: 'Ravioli',
      firstName: 'Ravi',
      email: 'raviravioli@pastatimestest.com',
      password: '12345abcdefg',
    };
    mockSierraServer.use(
      rest.post(routeUrls.patron, (req, res, ctx) => res(ctx.json(newPatron)))
    );

    it('returns a link on successful creation of patron record', async () => {
      const response = await client.createPatron(
        'Ravioli',
        'Ravi',
        'raviravioli@pastatimestest.com',
        '12345abcdefg'
      );

      expect(response.status).toBe(ResponseStatus.Success);
    });
  });

  describe('get deleted patron numbers', () => {
    const patrons: Array<{ id: number; deletedDate?: Date }> = [
      { id: 1234560, deletedDate: new Date('2020-01-01') },
      { id: 1234561, deletedDate: new Date('2020-02-01') },
      { id: 1234562, deletedDate: new Date('2020-03-01') },
      { id: 1234563, deletedDate: new Date('2020-04-01') },
      { id: 1234564, deletedDate: new Date('2020-05-01') },
      { id: 1234565, deletedDate: new Date('2020-06-01') },
      { id: 1234566, deletedDate: new Date('2020-07-01') },
      { id: 1234567, deletedDate: new Date('2020-08-01') },
      { id: 1234568 },
      { id: 1234569 },
    ];

    beforeEach(() => {
      mockSierraServer.use(
        rest.get(routeUrls.patrons, (req, res, ctx) => {
          const deletedDateParam =
            req.url.searchParams.get('deletedDate') || '';
          // We are trying to parse a string that looks like either yyyy-mm-dd or [yyyy-mm-dd, yyyy-mm-dd]
          const [startParam, endParam] = deletedDateParam.split(',');
          const start = startParam
            ? new Date(startParam.slice(1, 11))
            : undefined;
          const end = endParam ? new Date(endParam.slice(0, 10)) : undefined;

          const entries = patrons.filter(
            ({ deletedDate }) =>
              deletedDate &&
              (!start || deletedDate.getTime() >= start.getTime()) &&
              (!end || deletedDate.getTime() <= end.getTime())
          );

          if (entries.length === 0) {
            res(ctx.status(404));
          }

          return res(
            ctx.json({
              total: entries.length,
              start: 0,
              entries: entries.map(({ id }) => ({ id })),
            })
          );
        })
      );
    });

    it('gets deleted patron IDs', async () => {
      const response = await client.getDeletedRecordNumbers();
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<number[]>>response).result;
      expect(result).toContainAllValues(
        patrons.slice(0, 8).map(({ id }) => id)
      );
    });

    it('gets deleted patron IDs after a given date', async () => {
      const response = await client.getDeletedRecordNumbers({
        start: new Date('2020-05-01'),
      });
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<number[]>>response).result;
      expect(result).toContainAllValues(
        patrons.slice(4, 8).map(({ id }) => id)
      );
    });

    it('gets deleted patron IDs in a given date range', async () => {
      const response = await client.getDeletedRecordNumbers({
        start: new Date('2020-04-01'),
        end: new Date('2020-05-01'),
      });
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<number[]>>response).result;
      expect(result).toContainAllValues(
        patrons.slice(3, 5).map(({ id }) => id)
      );
    });

    it('returns an empty list if the API 404s', async () => {
      const response = await client.getDeletedRecordNumbers({
        start: new Date('1999-01-01'),
        end: new Date('1999-01-02'),
      });
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<number[]>>response).result;
      expect(result).toBeEmpty();
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
        verifiedEmail,
        createdDate: new Date(createdDate),
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
        verifiedEmail,
        createdDate: new Date(createdDate),
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
        verifiedEmail,
        createdDate: new Date(createdDate),
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
        verifiedEmail,
        createdDate: new Date(createdDate),
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
        verifiedEmail: email,
        createdDate: new Date(createdDate),
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
        verifiedEmail,
        createdDate: new Date(createdDate),
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
