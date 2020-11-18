import type {AxiosInstance} from 'axios';
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

  async validateCredentials(barcode: string, pin: string): Promise<PatronRecord> {
    return this.getInstance().then(instance => {
      return instance.post('/v6/patrons/validate', {
        barcode: barcode,
        pin: pin
      }, {
        validateStatus: status => status == 204
      }).then(() => {
        return this.getPatronRecordByBarcode(barcode);
      });
    });
  }

  async getPatronRecordByRecordNumber(recordNumber: string): Promise<PatronRecord> {
    return this.getInstance().then(instance => {
      return instance.get('/v6/patrons/' + recordNumber, {
        params: {
          fields: 'varFields'
        },
        validateStatus: status => status == 200
      }).then(response => {
        return this.toPatronRecord(response.data);
      });
    });
  }

  async getPatronRecordByBarcode(barcode: string): Promise<PatronRecord> {
    return this.getInstance().then(instance => {
      return instance.get('/v6/patrons/find', {
        params: {
          varFieldTag: 'b',
          varFieldContent: barcode,
          fields: 'varFields'
        },
        validateStatus: status => status == 200
      }).then(response => {
        return this.toPatronRecord(response.data);
      });
    });
  }

  async getPatronRecordByEmail(email: string): Promise<PatronRecord> {
    return this.getInstance().then(instance => {
      return instance.get('/v6/patrons/find', {
        params: {
          varFieldTag: 'z',
          varFieldContent: email,
          fields: 'varFields'
        },
        validateStatus: status => status == 200
      }).then(response => {
        return this.toPatronRecord(response.data);
      });
    });
  }

  private async getInstance(): Promise<AxiosInstance> {
    return axios.post(this.apiRoot + '/token', {}, {
      auth: {
        username: this.clientKey,
        password: this.clientSecret
      },
      validateStatus: status => status == 200
    }).then(response => {
      return axios.create({
        baseURL: this.apiRoot,
        headers: {
          Authorization: 'Bearer ' + response.data.access_token
        },
      });
    });
  }

  private toPatronRecord(data: any): PatronRecord {
    let nameVarField = this.extractVarField(data.varFields, 'n');
    let patronName = this.getPatronName(nameVarField);
    return Object.assign(patronName, {
        recordNumber: data.id,
        barcode: this.extractVarField(data.varFields, 'b'),
        emailAddress: this.extractVarField(data.varFields, 'z')
      }
    );
  }

  private extractVarField(varFields: VarField[], fieldTag: string) {
    let varField = varFields.find(varField => varField.fieldTag == fieldTag);
    return varField ? varField.content : '';
  }

  private getPatronName(varField: string): PatronName {
    if (!varField.trim()) {
      return {
        title: '',
        firstName: '',
        lastName: ''
      };
    }

    varField = varField.replace('100', '').replace('a|', '').replace('_', '');

    let lastName: string = '';
    if (varField.includes(',')) {
      lastName = varField.substring(0, varField.indexOf(','));
    }

    let title: string = '';
    if (varField.includes('|c')) {
      title = varField.substring(varField.indexOf('|c') + 2, varField.indexOf('|b'));
    }

    let firstName: string = '';
    if (varField.includes('|b')) {
      firstName = varField.substring(varField.indexOf('|b') + 2, varField.length);
    } else {
      firstName = varField.substring(varField.indexOf(',') + 1, varField.length);
    }

    return {
      title: title.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim()
    };
  }
}

interface VarField {
  fieldTag: string,
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
