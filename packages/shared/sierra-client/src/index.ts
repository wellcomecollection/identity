import type {AxiosInstance} from 'axios';
import axios from 'axios';
import toPatronRecord, {PatronRecord} from "./patron";
import {APIResponse, errorResponse, ResponseStatus, successResponse, unhandledError} from "@weco/identity-common";

export default class SierraClient {

  apiRoot: string;
  clientKey: string;
  clientSecret: string;

  constructor(apiRoot: string, clientKey: string, clientSecret: string) {
    this.apiRoot = apiRoot;
    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
  }

  async validateCredentials(barcode: string, pin: string): Promise<APIResponse<{}>> {
    return this.getInstance().then(instance => {
      return instance.post('/v6/patrons/validate', {
        barcode: barcode,
        pin: pin
      }, {
        validateStatus: status => status === 204
      }).then(() => {
        return successResponse({});
      }).catch(error => {
        switch (error.response.status) {
          case 400:
            return errorResponse('Invalid credentials for barcode [' + barcode + ']', ResponseStatus.InvalidCredentials);
          default:
            return unhandledError(error);
        }
      });
    });
  }

  async getPatronRecordByRecordNumber(recordNumber: string): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.get('/v6/patrons/' + recordNumber, {
        params: {
          fields: 'varFields'
        },
        validateStatus: status => status === 200 || status === 404
      }).then(response => {
        return successResponse(toPatronRecord(response.data));
      }).catch(error => {
        switch (error.response.status) {
          case 404:
            return errorResponse('Record with record number [' + recordNumber + '] not found', ResponseStatus.NotFound);
          default:
            return unhandledError(error);
        }
      });
    });
  }

  async getPatronRecordByBarcode(barcode: string): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.get('/v6/patrons/find', {
        params: {
          varFieldTag: 'b',
          varFieldContent: barcode,
          fields: 'varFields'
        },
        validateStatus: status => status === 200 || status === 404
      }).then(response => {
        return successResponse(toPatronRecord(response.data));
      }).catch(error => {
        switch (error.response.status) {
          case 404:
            return errorResponse('Record with barcode [' + barcode + '] not found', ResponseStatus.NotFound);
          default:
            return unhandledError(error);
        }
      });
    });
  }

  async getPatronRecordByEmail(email: string): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.get('/v6/patrons/find', {
        params: {
          varFieldTag: 'z',
          varFieldContent: email,
          fields: 'varFields'
        },
        validateStatus: status => status === 200 || status === 404
      }).then(response => {
        return successResponse(toPatronRecord(response.data));
      }).catch(error => {
        switch (error.response.status) {
          case 404:
            return errorResponse('Record with email address [' + email + '] not found', ResponseStatus.NotFound);
          default:
            return unhandledError(error);
        }
      });
    });
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
        baseURL: this.apiRoot,
        headers: {
          Authorization: 'Bearer ' + response.data.access_token
        }
      });
    });
  }
}
