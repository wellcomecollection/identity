import axios, { AxiosInstance } from 'axios';
import moxios from 'moxios';
import { ResponseStatus, SuccessResponse } from '@weco/identity-common';
import { PatronRecord, HttpSierraClient } from '../src';

describe('HTTP sierra client', () => {
  let client: HttpSierraClient;

  beforeEach(() => {
    moxios.install(axios as AxiosInstance);
    moxios.stubRequest(apiRoot + '/token', {
      status: 200,
      response: {
        access_token: accessToken,
      },
    });

    client = new HttpSierraClient(apiRoot, clientKey, clientSecret);
  });

  afterEach(() => {
    moxios.uninstall(axios as AxiosInstance);
  });

  describe('validate credentials', () => {
    it('validates', async () => {
      moxios.stubRequest('/patrons/auth', {
        status: 200,
        response: {},
      });

      const response = await client.validateCredentials(barcode, pin);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<{}>>response).result;
      expect(result).toEqual({});
    });

    it('does not validate', async () => {
      moxios.stubRequest('/patrons/auth', {
        status: 400,
      });

      const response = await client.validateCredentials(barcode, pin);
      expect(response.status).toBe(ResponseStatus.InvalidCredentials);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/patrons/auth', {
        status: 500,
      });

      const response = await client.validateCredentials(barcode, pin);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('get patron record by record number', () => {
    it('finds the record with non-marc name', async () => {
      moxios.stubRequest(
        '/patrons/' + recordNumber + '?fields=varFields,deleted',
        {
          status: 200,
          response: recordNonMarc,
        }
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
      });
    });

    it('finds the record with marc name', async () => {
      moxios.stubRequest(
        '/patrons/' + recordNumber + '?fields=varFields,deleted',
        {
          status: 200,
          response: recordMarc,
        }
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
      });
    });

    it('finds the deleted record', async () => {
      moxios.stubRequest(
        '/patrons/' + recordNumber + '?fields=varFields,deleted',
        {
          status: 200,
          response: {
            deleted: true,
          },
        }
      );

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('does not find the record', async () => {
      moxios.stubRequest(
        '/patrons/' + recordNumber + '?fields=varFields,deleted',
        {
          status: 404,
        }
      );

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest(
        '/patrons/' + recordNumber + '?fields=varFields,deleted',
        {
          status: 500,
        }
      );

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('get patron record by email', () => {
    it('finds the record with non-marc name', async () => {
      moxios.stubRequest(
        '/patrons/find?varFieldTag=z&varFieldContent=' +
          email +
          '&fields=varFields',
        {
          status: 200,
          response: recordNonMarc,
        }
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
      });
    });

    it('finds the record with marc name', async () => {
      moxios.stubRequest(
        '/patrons/find?varFieldTag=z&varFieldContent=' +
          email +
          '&fields=varFields',
        {
          status: 200,
          response: recordMarc,
        }
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
      });
    });

    it('does not find the record', async () => {
      moxios.stubRequest(
        '/patrons/find?varFieldTag=z&varFieldContent=' +
          email +
          '&fields=varFields',
        {
          status: 404,
        }
      );

      const response = await client.getPatronRecordByEmail(email);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest(
        '/patrons/find?varFieldTag=z&varFieldContent=' +
          email +
          '&fields=varFields',
        {
          status: 500,
        }
      );

      const response = await client.getPatronRecordByEmail(email);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });

  describe('update patron record', () => {
    it('updates the record', async () => {
      moxios.stubOnce('put', '/patrons/' + recordNumber, {
        status: 204,
      });
      moxios.stubOnce(
        'get',
        '/patrons/' + recordNumber + '?fields=varFields,deleted',
        {
          status: 200,
          response: recordMarc,
        }
      );

      const response = await client.updatePatronRecord(recordNumber, email);
      expect(response.status).toBe(ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      expect(result).toEqual({
        barcode,
        email,
        firstName,
        lastName,
        recordNumber,
      });
    });

    it('does not update the record', async () => {
      moxios.stubRequest('/patrons/' + recordNumber, {
        status: 400,
      });

      const response = await client.updatePatronRecord(recordNumber, email);
      expect(response.status).toBe(ResponseStatus.MalformedRequest);
    });

    it('returns a 404 if there is no user', async () => {
      moxios.stubRequest('/patrons/' + recordNumber, {
        status: 404,
      });

      const response = await client.updatePatronRecord(recordNumber, email);
      expect(response.status).toBe(ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/patrons/' + recordNumber, {
        status: 500,
      });

      const response = await client.updatePatronRecord(recordNumber, email);
      expect(response.status).toBe(ResponseStatus.UnknownError);
    });
  });
});

const apiRoot: string = 'https://localhost';
const clientKey: string = 'abcdefghijklmnopqrstuvwxyz';
const clientSecret: string = 'ABCDEFGHIJKLMNOPQRSTUVYWXYZ';

const accessToken: string = 'a1b23c4d5e6f7g8hj';
const recordNumber: number = 123456;
const barcode: string = '654321';
const pin: string = 'superstrongpassword';
const firstName: string = 'Test';
const lastName: string = 'User';
const email: string = 'test.user@example.com';

const recordMarc: any = {
  id: 123456,
  varFields: [
    {
      fieldTag: 'b',
      content: barcode,
    },
    {
      fieldTag: 'z',
      content: email,
    },
    {
      fieldTag: 'n',
      marcTag: '100',
      ind1: ' ',
      ind2: ' ',
      subfields: [
        {
          tag: 'a',
          content: lastName,
        },
        {
          tag: 'b',
          content: firstName,
        },
      ],
    },
  ],
};

const recordNonMarc: any = {
  id: 123456,
  varFields: [
    {
      fieldTag: 'b',
      content: barcode,
    },
    {
      fieldTag: 'z',
      content: email,
    },
    {
      fieldTag: 'n',
      content: 'a|' + lastName + ', |b' + firstName,
    },
  ],
};
