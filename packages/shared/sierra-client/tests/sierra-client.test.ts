import SierraClient from "../lib";
import moxios from 'moxios';
import axios, {AxiosInstance} from 'axios';
import {equal} from 'assert'
import {ResponseStatus, SuccessResponse} from "@weco/identity-common";
import {PatronRecord} from "../lib/patron";

describe('sierra client', () => {

  let client: SierraClient;

  beforeEach(() => {
    // @ts-ignore
    moxios.install(axios as AxiosInstance);
    moxios.stubRequest(apiRoot + '/token', {
      status: 200,
      response: {
        access_token: accessToken
      }
    });

    client = new SierraClient(apiRoot, clientKey, clientSecret);
  });

  afterEach(() => {
    // @ts-ignore
    moxios.uninstall(axios as AxiosInstance);
  });

  describe('validate credentials', () => {

    it('validates', async () => {
      moxios.stubRequest('/patrons/validate', {
        status: 204,
        response: {}
      });

      const response = await client.validateCredentials(barcode, pin);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<{}>>response).result;
      equal(Object.keys(result).length, 0);
    });

    it('does not validate', async () => {
      moxios.stubRequest('/patrons/validate', {
        status: 400
      });

      const response = await client.validateCredentials(barcode, pin);
      equal(response.status, ResponseStatus.InvalidCredentials);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/patrons/validate', {
        status: 500
      });

      const response = await client.validateCredentials(barcode, pin);
      equal(response.status, ResponseStatus.UnknownError)
    });
  });

  describe('get patron record by record number', () => {

    it('finds the record with non-marc name', async () => {
      moxios.stubRequest('/patrons/' + recordNumber + '?fields=varFields', {
        status: 200,
        response: recordNonMarc
      });

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      equal(result.barcode, barcode);
      equal(result.email, email);
      equal(result.firstName, firstName);
      equal(result.lastName, lastName);
      equal(result.recordNumber, recordNumber);
      equal(result.title, title);
    });

    it('finds the record with marc name', async () => {
      moxios.stubRequest('/patrons/' + recordNumber + '?fields=varFields', {
        status: 200,
        response: recordMarc
      });

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      equal(result.barcode, barcode);
      equal(result.email, email);
      equal(result.firstName, firstName);
      equal(result.lastName, lastName);
      equal(result.recordNumber, recordNumber);
      equal(result.title, title);
    });

    it('does not find the record', async () => {
      moxios.stubRequest('/patrons/' + recordNumber + '?fields=varFields', {
        status: 404
      });

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      equal(response.status, ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/patrons/' + recordNumber + '?fields=varFields', {
        status: 500
      });

      const response = await client.getPatronRecordByRecordNumber(recordNumber);
      equal(response.status, ResponseStatus.UnknownError);
    });
  });

  describe('get patron record by barcode', () => {

    it('finds the record with non-marc name', async () => {
      moxios.stubRequest('/patrons/find?varFieldTag=b&varFieldContent=' + barcode + '&fields=varFields', {
        status: 200,
        response: recordNonMarc
      });

      const response = await client.getPatronRecordByBarcode(barcode);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      equal(result.barcode, barcode);
      equal(result.email, email);
      equal(result.firstName, firstName);
      equal(result.lastName, lastName);
      equal(result.recordNumber, recordNumber);
      equal(result.title, title);
    });

    it('finds the record with marc name', async () => {
      moxios.stubRequest('/patrons/find?varFieldTag=b&varFieldContent=' + barcode + '&fields=varFields', {
        status: 200,
        response: recordMarc
      });

      const response = await client.getPatronRecordByBarcode(barcode);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      equal(result.barcode, barcode);
      equal(result.email, email);
      equal(result.firstName, firstName);
      equal(result.lastName, lastName);
      equal(result.recordNumber, recordNumber);
      equal(result.title, title);
    });

    it('does not find the record', async () => {
      moxios.stubRequest('/patrons/find?varFieldTag=b&varFieldContent=' + barcode + '&fields=varFields', {
        status: 404
      });

      const response = await client.getPatronRecordByBarcode(barcode);
      equal(response.status, ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/patrons/find?varFieldTag=b&varFieldContent=' + barcode + '&fields=varFields', {
        status: 500
      });

      const response = await client.getPatronRecordByBarcode(barcode);
      equal(response.status, ResponseStatus.UnknownError);
    });
  });

  describe('get patron record by email', () => {

    it('finds the record with non-marc name', async () => {
      moxios.stubRequest('/patrons/find?varFieldTag=z&varFieldContent=' + email + '&fields=varFields', {
        status: 200,
        response: recordNonMarc
      });

      const response = await client.getPatronRecordByEmail(email);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      equal(result.barcode, barcode);
      equal(result.email, email);
      equal(result.firstName, firstName);
      equal(result.lastName, lastName);
      equal(result.recordNumber, recordNumber);
      equal(result.title, title);
    });

    it('finds the record with marc name', async () => {
      moxios.stubRequest('/patrons/find?varFieldTag=z&varFieldContent=' + email + '&fields=varFields', {
        status: 200,
        response: recordMarc
      });

      const response = await client.getPatronRecordByEmail(email);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<PatronRecord>>response).result;
      equal(result.barcode, barcode);
      equal(result.email, email);
      equal(result.firstName, firstName);
      equal(result.lastName, lastName);
      equal(result.recordNumber, recordNumber);
      equal(result.title, title);
    });

    it('does not find the record', async () => {
      moxios.stubRequest('/patrons/find?varFieldTag=z&varFieldContent=' + email + '&fields=varFields', {
        status: 404
      });

      const response = await client.getPatronRecordByEmail(email);
      equal(response.status, ResponseStatus.NotFound);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/patrons/find?varFieldTag=z&varFieldContent=' + email + '&fields=varFields', {
        status: 500
      });

      const response = await client.getPatronRecordByEmail(email);
      equal(response.status, ResponseStatus.UnknownError);
    });
  });

  describe('create patron record', () => {

    it('creates the record', async () => {
      moxios.stubRequest('/patrons', {
        status: 200,
        response: {
          link: apiRoot + '/v6/patrons/' + recordNumber
        }
      });

      const response = await client.createPatronRecord(title, firstName, lastName, pin);
      equal(response.status, ResponseStatus.Success);

      const result = (<SuccessResponse<number>>response).result;
      equal(result, recordNumber);
    });

    it('does not create the record', async () => {
      moxios.stubRequest('/patrons', {
        status: 400
      });

      const response = await client.createPatronRecord(title, firstName, lastName, pin);
      equal(response.status, ResponseStatus.MalformedRequest);
    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/patrons', {
        status: 500
      });

      const response = await client.createPatronRecord(title, firstName, lastName, pin);
      equal(response.status, ResponseStatus.UnknownError);
    });
  });

  describe('update patron post creation fields', () => {

    it('updates the record', async () => {
      moxios.stubOnce('put', '/patrons/' + recordNumber, {
        status: 204
      });
      moxios.stubOnce('get', '/patrons/' + recordNumber + '?fields=varFields', {
        status: 200,
        response: recordMarc
      });

      const response = await client.updatePatronPostCreationFields(recordNumber, email);
      equal(response.status, ResponseStatus.Success)

      const result = (<SuccessResponse<PatronRecord>>response).result;
      equal(result.barcode, barcode);
      equal(result.email, email);
      equal(result.firstName, firstName);
      equal(result.lastName, lastName);
      equal(result.recordNumber, recordNumber);
      equal(result.title, title);
    });

    it('does not update the record', async () => {
      moxios.stubRequest('/patrons/' + recordNumber, {
        status: 400
      });

      const response = await client.updatePatronPostCreationFields(recordNumber, email);
      equal(response.status, ResponseStatus.MalformedRequest)

    });

    it('returns an unexpected response code', async () => {
      moxios.stubRequest('/patrons/' + recordNumber, {
        status: 500
      });

      const response = await client.updatePatronPostCreationFields(recordNumber, email);
      equal(response.status, ResponseStatus.UnknownError)
    });
  });
});

const apiRoot: string = 'https://localhost';
const clientKey: string = 'abcdefghijklmnopqrstuvwxyz';
const clientSecret: string = 'ABCDEFGHIJKLMNOPQRSTUVYWXYZ';

const accessToken: string = 'a1b23c4d5e6f7g8hj';
const recordNumber: number = 123456;
const barcode: string = "654321";
const pin: string = "superstrongpassword";
const title: string = "Mr";
const firstName: string = "Test";
const lastName: string = "User";
const email: string = "test.user@example.com";

const recordMarc: any = {
  id: 123456,
  varFields: [
    {
      fieldTag: "b",
      content: barcode
    },
    {
      fieldTag: "z",
      content: email
    },
    {
      fieldTag: "n",
      marcTag: "100",
      ind1: " ",
      ind2: " ",
      subfields: [
        {
          tag: "a",
          content: lastName
        },
        {
          tag: "c",
          content: title
        },
        {
          tag: "b",
          content: firstName
        }
      ]
    }
  ]
}

const recordNonMarc: any = {
  id: 123456,
  varFields: [
    {
      fieldTag: "b",
      content: barcode
    },
    {
      fieldTag: "z",
      content: email
    },
    {
      fieldTag: "n",
      content: "a|" + lastName + ", |c" + title + " |b" + firstName
    }
  ]
}
