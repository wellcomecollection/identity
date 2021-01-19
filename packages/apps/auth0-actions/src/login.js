function login(email, password, callback) {

    const axios = require('axios');

    const apiRoot = configuration.API_ROOT;
    const clientKey = configuration.CLIENT_KEY;
    const clientSecret = configuration.CLIENT_SECRET;

    getPatronRecordByEmail(email).then(patronRecord => {
        validateCredentials(patronRecord.barcode, password).then(() => {
            callback(null, {
                user_id: 'p' + patronRecord.recordNumber,
                email: patronRecord.email,
                name: patronRecord.firstName + ' ' + patronRecord.lastName,
                given_name: patronRecord.firstName,
                family_name: patronRecord.lastName
            });
        }).catch(error => {
            callback(error)
        });
    }).catch(error => {
        callback(error);
    });

    async function validateCredentials(barcode, pin) {
        return getInstance().then(instance => {
            return instance.post('/v6/patrons/validate', {
                barcode: barcode,
                pin: pin
            }, {
                validateStatus: status => status === 204
            }).then(() => {
                return getPatronRecordByBarcode(barcode);
            });
        });
    }

    async function getPatronRecordByBarcode(barcode) {
        return getInstance().then(instance => {
            return instance.get('/v6/patrons/find', {
                params: {
                    varFieldTag: 'b',
                    varFieldContent: barcode,
                    fields: 'varFields'
                },
                validateStatus: status => status === 200
            }).then(response => {
                return toPatronRecord(response.data);
            });
        });
    }

    async function getPatronRecordByEmail(email) {
        return getInstance().then(instance => {
            return instance.get('/v6/patrons/find', {
                params: {
                    varFieldTag: 'z',
                    varFieldContent: email,
                    fields: 'varFields'
                },
                validateStatus: status => status === 200
            }).then(response => {
                return toPatronRecord(response.data);
            });
        });
    }

    async function getInstance() {
        return axios.post(apiRoot + '/token', {}, {
            auth: {
                username: clientKey,
                password: clientSecret
            },
            validateStatus: status => status === 200
        }).then(response => {
            return axios.create({
                baseURL: apiRoot,
                headers: {
                    Authorization: 'Bearer ' + response.data.access_token
                },
            });
        });
    }

    function toPatronRecord(data) {
        const patronName = getPatronName(data.varFields);
        return Object.assign(patronName, {
            recordNumber: data.id,
            barcode: getVarFieldContent(data.varFields, 'b'),
            email: getVarFieldContent(data.varFields, 'z')
        });
    }

    function getVarFieldContent(varFields, fieldTag) {
        const found = varFields.find(varField => varField.fieldTag === fieldTag);
        return found ? found.content || '' : '';
    }

    function getPatronName(varFields) {
        const found = varFields.find(varField => varField.fieldTag === 'n');
        if (found && found.content) {
            return getPatronNameNonMarc(found.content);
        } else if (found && found.subfields) {
            return getPatronNameMarc(found.subfields);
        } else {
            return {
                firstName: '',
                lastName: ''
            }
        }
    }

    function getPatronNameMarc(subFields) {
        const firstName = subFields.find(subField => subField.tag === 'b')
        const lastName = subFields.find(subField => subField.tag === 'a')
        return {
            firstName: firstName ? firstName.content.trim() : '',
            lastName: lastName ? lastName.content.trim() : ''
        }
    }

    function getPatronNameNonMarc(content) {
        if (!content.trim()) {
            return {
                firstName: '',
                lastName: ''
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
            lastName: lastName.trim()
        };
    }
}
