import type {AxiosError, AxiosInstance} from 'axios';
import axios from 'axios';

export default class SierraClient {

  apiRoot: string;
  clientKey: string;
  clientSecret: string;

  constructor(apiRoot: string, clientKey: string, clientSecret: string) {
    this.apiRoot = apiRoot;
    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
  }

  async validateCredentials(barcode: string, pin: string): Promise<SierraResponse<{}>> {
    return this.getInstance().then(instance => {
      return instance.post('/v6/patrons/validate', {
        barcode: barcode,
        pin: pin
      }, {
        validateStatus: status => status === 204
      }).then(() => {
        return this.success({});
      }).catch(error => {
        switch (error.response.status) {
          case 400:
            return this.error('Invalid credentials for barcode [' + barcode + ']', SierraStatus.InvalidCredentials);
          default:
            return this.unhandledError(error);
        }
      });
    });
  }

  async getPatronRecordByRecordNumber(recordNumber: string): Promise<SierraResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.get('/v6/patrons/' + recordNumber, {
        params: {
          fields: 'varFields'
        },
        validateStatus: status => status === 200 || status === 404
      }).then(response => {
        return this.success(this.toPatronRecord(response.data));
      }).catch(error => {
        switch (error.response.status) {
          case 404:
            return this.error('Record with record number [' + recordNumber + '] not found', SierraStatus.NotFound);
          default:
            return this.unhandledError(error);
        }
      });
    });
  }

  async getPatronRecordByBarcode(barcode: string): Promise<SierraResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.get('/v6/patrons/find', {
        params: {
          varFieldTag: 'b',
          varFieldContent: barcode,
          fields: 'varFields'
        },
        validateStatus: status => status === 200 || status === 404
      }).then(response => {
        return this.success(this.toPatronRecord(response.data));
      }).catch(error => {
        switch (error.response.status) {
          case 404:
            return this.error('Record with barcode [' + barcode + '] not found', SierraStatus.NotFound);
          default:
            return this.unhandledError(error);
        }
      });
    });
  }

  async getPatronRecordByEmail(email: string): Promise<SierraResponse<PatronRecord>> {
    return this.getInstance().then(instance => {
      return instance.get('/v6/patrons/find', {
        params: {
          varFieldTag: 'z',
          varFieldContent: email,
          fields: 'varFields'
        },
        validateStatus: status => status === 200 || status === 404
      }).then(response => {
        return this.success(this.toPatronRecord(response.data));
      }).catch(error => {
        switch (error.response.status) {
          case 404:
            return this.error('Record with email address [' + email + '] not found', SierraStatus.NotFound);
          default:
            return this.unhandledError(error);
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

  private toPatronRecord(data: any): PatronRecord {
    const patronName = this.getPatronName(data.varFields);
    return Object.assign(patronName, {
        recordNumber: data.id,
        barcode: this.extractVarFieldContent(data.varFields, 'b'),
        emailAddress: this.extractVarFieldContent(data.varFields, 'z')
      }
    );
  }

  private extractVarFieldContent(varFields: VarField[], fieldTag: string) {
    const found = varFields.find(varField => varField.fieldTag === fieldTag);
    return found ? found.content : '';
  }

  private getPatronName(varFields: VarField[]) {
    const found = varFields.find(varField => varField.fieldTag === 'n');
    if (found && found.content) {
      return this.getPatronNameNonMarc(found.content);
    } else if (found && found.subFields) {
      return this.getPatronNameMarc(found.subFields);
    } else {
      return {
        title: '',
        firstName: '',
        lastName: ''
      }
    }
  }

  private getPatronNameMarc(subFields: VarSubField[]): PatronName {
    const title = subFields.find(subField => subField.tag === 'c')
    const firstName = subFields.find(subField => subField.tag === 'b')
    const lastName = subFields.find(subField => subField.tag === 'a')
    return {
      title: title ? title.content.trim() : '',
      firstName: firstName ? firstName.content.trim() : '',
      lastName: lastName ? lastName.content.trim() : ''
    }
  }

  private getPatronNameNonMarc(content: string): PatronName {
    if (!content.trim()) {
      return {
        title: '',
        firstName: '',
        lastName: ''
      };
    }

    content = content.replace('100', '').replace('a|', '').replace('_', '');

    let lastName = '';
    if (content.includes(',')) {
      lastName = content.substring(0, content.indexOf(','));
    }

    let title = '';
    if (content.includes('|c')) {
      title = content.substring(content.indexOf('|c') + 2, content.indexOf('|b'));
    }

    let firstName = '';
    if (content.includes('|b')) {
      firstName = content.substring(content.indexOf('|b') + 2, content.length);
    } else {
      firstName = content.substring(content.indexOf(',') + 1, content.length);
    }

    return {
      title: title.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim()
    };
  }

  private success<T>(result: T): SuccessResponse<T> {
    return {
      result: result,
      status: SierraStatus.Success
    }
  }

  private error(message: string, status: SierraStatus.NotFound | SierraStatus.InvalidCredentials): ErrorResponse {
    return {
      message: message,
      status: status
    }
  }

  private unhandledError(error: AxiosError): ErrorResponse {
    return {
      message: 'Unexpected Sierra response: [' + error.message + ']',
      status: SierraStatus.UnknownError
    }
  }
}

interface VarField {
  fieldTag: string,
  content: string,
  subFields: VarSubField[]
}

interface VarSubField {
  tag: string,
  content: string
}

interface PatronName {
  title: string;
  firstName: string;
  lastName: string;
}

interface PatronRecord extends PatronName {
  recordNumber: string;
  barcode: string;
  emailAddress: string;
}

export enum SierraStatus {
  Success,
  NotFound,
  InvalidCredentials,
  UnknownError
}

type SuccessResponse<T> = {
  result: T,
  status: SierraStatus.Success
}

type ErrorResponse = {
  message: string,
  status: SierraStatus.NotFound | SierraStatus.InvalidCredentials | SierraStatus.UnknownError
}

type SierraResponse<T> = SuccessResponse<T> | ErrorResponse;
