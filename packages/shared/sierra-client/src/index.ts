import { APIResponse, errorResponse, ResponseStatus, successResponse, unhandledError } from '@weco/identity-common';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { extractRecordNumberFromLink, PatronRecord, toCreatePatron, toPatronRecord } from './patron';

export default class SierraClient {

  private readonly apiRoot: string;
  private readonly clientKey: string;
  private readonly clientSecret: string;

  constructor(apiRoot: string, clientKey: string, clientSecret: string) {
    this.apiRoot = apiRoot;
    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
  }

  async validateCredentials(barcode: string, pin: string): Promise<APIResponse<{}>> {
    return this.getInstance().then(instance => {
      return instance.post('/patrons/validate', {
        barcode: barcode,
        pin: pin
      }, {
        validateStatus: status => status === 204
      }).then(() =>
        successResponse({})
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              return errorResponse('Invalid Patron credentials for barcode [' + barcode + ']', ResponseStatus.InvalidCredentials, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async getPatronRecordByRecordNumber(recordNumber: number): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.get('/patrons/' + recordNumber, {
        params: {
          fields: 'varFields'
        },
        validateStatus: status => status === 200
      }).then(response => {
          console.log(JSON.stringify(response.data));
          console.log(JSON.stringify(response.data.deleted));
          if (!response.data.deleted) {
            return successResponse(toPatronRecord(response.data))
          } else {
            return errorResponse('Patron record with record number [' + recordNumber + '] is deleted', ResponseStatus.NotFound);
          }
        }
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 404:
              return errorResponse('Patron record with record number [' + recordNumber + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async getPatronRecordByBarcode(barcode: string): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.get('/patrons/find', {
        params: {
          varFieldTag: 'b',
          varFieldContent: barcode,
          fields: 'varFields'
        },
        validateStatus: status => status === 200
      }).then(response =>
            successResponse(toPatronRecord(response.data))
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 404:
              return errorResponse('Patron record with barcode [' + barcode + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async getPatronRecordByEmail(email: string): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.get('/patrons/find', {
        params: {
          varFieldTag: 'z',
          varFieldContent: email.toLowerCase(),
          fields: 'varFields'
        },
        validateStatus: status => status === 200
      }).then(response =>
            successResponse(toPatronRecord(response.data))
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 404:
              return errorResponse('Patron record with email address [' + email + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async createPatronRecord(firstName: string, lastName: string, pin: string): Promise<APIResponse<number>> {
    return this.getInstance().then(instance => {
      return instance.post('/patrons', toCreatePatron(firstName, lastName, pin), {
        validateStatus: status => status === 200
      }).then(response =>
        successResponse(extractRecordNumberFromLink(response.data.link))
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              return errorResponse('Malformed or invalid Patron record creation request', ResponseStatus.MalformedRequest, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async updatePatronPostCreationFields(recordNumber: number, email: string): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.put('/patrons/' + recordNumber, {
        emails: [email],
        barcodes: [recordNumber.toString()]
      }, {
        validateStatus: status => status === 204
      }).then(() =>
        this.getPatronRecordByRecordNumber(recordNumber)
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              return errorResponse('Malformed or invalid Patron barcode update request', ResponseStatus.MalformedRequest, error);
            case 404:
              return errorResponse('Patron record with record number [' + recordNumber + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
      });
    })
  }

  private async getInstance(): Promise<AxiosInstance> {
    return axios.post(this.apiRoot + '/token', {}, {
      auth: {
        username: this.clientKey,
        password: this.clientSecret
      },
      validateStatus: status => status === 200
    }).then(response => {
      return axios.create({
        baseURL: this.apiRoot + '/v6',
        headers: {
          Authorization: 'Bearer ' + response.data.access_token
        }
      });
    });
  }
}
