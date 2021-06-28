function login(email, password, callback) {
  const axios = require('axios');

  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  doLogin(email, password)
    .then((result) => callback(null, result))
    .catch((error) => callback(error));

  async function doLogin(email, password) {
    try {
      const patronRecord = await getPatronRecordByEmail(email);
      await validateCredentials(patronRecord.recordNumber, password);
      return {
        user_id: 'p' + patronRecord.recordNumber,
        email: patronRecord.email,
        name: patronRecord.firstName + ' ' + patronRecord.lastName,
        given_name: patronRecord.firstName,
        family_name: patronRecord.lastName,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return;
      }
      throw error;
    }
  }

  // The /v6/patrons/validate expects passwords encoded using the encodeURIComponent scheme.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
  // For example the password ;,/?:@&=+$-_.!~*'()# must be encoded as %3B%2C%2F%3F%3A%40%26%3D%2B%24-_.!~*%27()%23
  async function validateCredentials(id, secret) {
    const instance = await getInstance();
    return instance.post(
      '/v6/patrons/auth',
      {
        authMethod: 'native',
        patronId: id,
        patronSecret: secret,
      },
      {
        validateStatus: (status) => status === 200,
      }
    );
  }

  async function getPatronRecordByEmail(email) {
    const instance = await getInstance();
    const response = await instance.get('/v6/patrons/find', {
      params: {
        varFieldTag: 'z',
        varFieldContent: email,
        fields: 'varFields',
      },
      validateStatus: (status) => status === 200,
    });

    return toPatronRecord(response.data);
  }

  async function getInstance() {
    const response = await axios.post(
      apiRoot + '/token',
      {},
      {
        auth: {
          username: clientKey,
          password: clientSecret,
        },
        validateStatus: (status) => status === 200,
      }
    );

    return axios.create({
      baseURL: apiRoot,
      headers: {
        Authorization: 'Bearer ' + response.data.access_token,
      },
    });
  }

  function toPatronRecord(data) {
    const patronName = getPatronName(data.varFields);
    return Object.assign(patronName, {
      recordNumber: data.id,
      barcode: getVarFieldContent(data.varFields, 'b'),
      email: getVarFieldContent(data.varFields, 'z'),
    });
  }

  function getVarFieldContent(varFields, fieldTag) {
    const found = varFields.find((varField) => varField.fieldTag === fieldTag);
    return found ? found.content || '' : '';
  }

  function getPatronName(varFields) {
    const found = varFields.find((varField) => varField.fieldTag === 'n');
    if (found && found.content) {
      return getPatronNameNonMarc(found.content);
    } else if (found && found.subfields) {
      return getPatronNameMarc(found.subfields);
    } else {
      return {
        firstName: '',
        lastName: '',
      };
    }
  }

  function getPatronNameMarc(subFields) {
    const firstName = subFields.find((subField) => subField.tag === 'b');
    const lastName = subFields.find((subField) => subField.tag === 'a');
    return {
      firstName: firstName ? firstName.content.trim().replace(/(,*)$/, '') : '',
      lastName: lastName ? lastName.content.trim().replace(/(,*)$/, '') : '',
    };
  }

  function getPatronNameNonMarc(content) {
    if (!content.trim()) {
      return {
        firstName: '',
        lastName: '',
      };
    }

    content = content.replace('100', '').replace('a|', '').replace('_', '');

    let lastName = '';
    if (content.includes(',')) {
      lastName = content.substring(0, content.indexOf(','));
    }

    let firstName = '';
    if (content.includes('|b')) {
      firstName = content.substring(content.indexOf('|b') + 2, content.length);
    } else {
      firstName = content.substring(content.indexOf(',') + 1, content.length);
    }

    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };
  }
}
