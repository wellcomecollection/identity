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
          fields: 'varFields,deleted'
        },
        validateStatus: status => status === 200
      }).then(response => {
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
      // Varfield tag 'b' is used for the patron's barcode
      // See https://documentation.iii.com/sierrahelp/Default.htm#sril/sril_records_varfld_types_patron.html
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
      // Varfield tag 'z' is used for the patron's email address
      // See https://documentation.iii.com/sierrahelp/Default.htm#sril/sril_records_varfld_types_patron.html
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
            // TODO: Do email addresses count as PII?  Will this response be logged anywhere?
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
            case 400: {
              // I think this is referring to API error code 136 "PIN is not valid"
              // See https://techdocs.iii.com/sierraapi/Content/zReference/errorHandling.htm
              // TODO: Check this is what's being tested here.
              // TODO: What is specificCode == 3 for?
              if (error.response.data?.code === 136 && error.response.data?.specificCode === 3) {
                return errorResponse('Password does not meet Sierra policy', ResponseStatus.PasswordTooWeak, error);
              } else {
                return errorResponse('Malformed or invalid Patron record creation request', ResponseStatus.MalformedRequest, error);
              }
            }
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
              return errorResponse('Malformed or invalid Patron record update request', ResponseStatus.MalformedRequest, error);
            case 404:
              return errorResponse('Patron record with record number [' + recordNumber + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async deletePatronRecord(recordNumber: number): Promise<APIResponse<{}>> {
    return this.getInstance().then(instance => {
      return instance.delete('/patrons/' + recordNumber, {
        validateStatus: status => status === 204
      }).then(() => {
        return successResponse({});
      }).catch(error => {
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

  async updatePatronRecord(recordNumber: number, email: string): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.put('/patrons/' + recordNumber, {
        emails: [email]
      }, {
        validateStatus: status => status === 204
      }).then(() =>
        this.getPatronRecordByRecordNumber(recordNumber)
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              return errorResponse('Malformed or invalid Patron record update request', ResponseStatus.MalformedRequest, error);
            case 404:
              return errorResponse('Patron record with record number [' + recordNumber + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
      });
    });
  }

  async updatePassword(recordNumber: number, password: string): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.put('/patrons/' + recordNumber, {
        pin: password
      }, {
        validateStatus: status => status === 204
      }).then(() =>
        this.getPatronRecordByRecordNumber(recordNumber)
      ).catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              // I think this is referring to API error code 136 "PIN is not valid"
              // See https://techdocs.iii.com/sierraapi/Content/zReference/errorHandling.htm
              // TODO: Check this is what's being tested here.
              // TODO: What is specificCode == 3 for?
              if (error.response.data?.code === 136 && error.response.data?.specificCode === 3) {
                return errorResponse('Password does not meet Sierra policy', ResponseStatus.PasswordTooWeak, error);
              } else {
                return errorResponse('Malformed or invalid Patron record update request', ResponseStatus.MalformedRequest, error);
              }
            case 404:
              return errorResponse('Patron record with record number [' + recordNumber + '] not found', ResponseStatus.NotFound, error);
          }
        }
        return unhandledError(error);
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
        baseURL: this.apiRoot + '/v6',
        headers: {
          Authorization: 'Bearer ' + response.data.access_token
        }
      });
    });
  }
}
