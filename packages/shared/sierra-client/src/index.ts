import type {AxiosInstance} from 'axios';
import axios from 'axios';

export default class SierraClient {

  static async instance(apiRoot: string, clientKey: string, clientSecret: string): Promise<SierraClient> {
    const accessToken = await this.getAccessToken(apiRoot, clientKey, clientSecret);
    const axiosInstance = this.createAxiosInstance(apiRoot, accessToken);
    return new SierraClient(axiosInstance);
  }

  private static async getAccessToken(apiRoot: string, clientKey: string, clientSecret: string): Promise<string> {
    const response = await axios.post(apiRoot + '/token', {}, {
      auth: {
        username: clientKey,
        password: clientSecret
      },
      validateStatus: status => status == 200
    });
    return response.data.access_token;
  }

  private static createAxiosInstance(apiRoot: string, accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: apiRoot,
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });
  }

  axiosInstance: AxiosInstance;

  private constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async validateCredentials(barcode: string, pin: string): Promise<PatronRecord> {
    await axios.post('/v6/patrons/validate', {
      barcode: barcode,
      pin: pin
    }, {
      validateStatus: status => status == 204
    });

    return this.getPatronRecordByBarcode(barcode);
  }

  async getPatronRecordByRecordNumber(recordNumber: string): Promise<PatronRecord> {
    const response = await axios.get('/v6/patrons/' + recordNumber, {
      params: {
        fields: 'varFields'
      },
      validateStatus: status => status == 200
    });

    return this.toPatronRecord(response.data);
  }

  async getPatronRecordByBarcode(barcode: string): Promise<PatronRecord> {
    const response = await axios.get('/v6/patrons/find', {
      params: {
        varFieldTag: 'b',
        varFieldContent: barcode,
        fields: 'varFields'
      },
      validateStatus: status => status == 200
    });

    return this.toPatronRecord(response.data);
  }

  async getPatronRecordByEmail(email: string): Promise<PatronRecord> {
    const response = await axios.get('/v6/patrons/find', {
      params: {
        varFieldTag: 'z',
        varFieldContent: email,
        fields: 'varFields'
      },
      validateStatus: status => status == 200
    });

    return this.toPatronRecord(response.data);
  }

  private toPatronRecord(data: any): PatronRecord {
    let nameVarField = this.extractVarField(data.varFields, 'n');
    let patronName = this.getPatronName(nameVarField);
    return Object.assign(patronName, {
        recordNumber: data.id,
        barcode: this.extractVarField(data.varFields, 'b'),
        emailAddress: this.extractVarField(data.varFields, 'z')
      }
    )
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
      }
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
    }
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
