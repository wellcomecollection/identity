function login(email, password, callback) {

    const axios = require('axios');

    const apiRoot = configuration.API_ROOT;
    const clientKey = configuration.CLIENT_KEY;
    const clientSecret = configuration.CLIENT_SECRET;

    getPatronRecordByEmail(email).then(patronRecord => {
        validateCredentials(patronRecord.barcode, password).then(() => {
            callback(null, {
                user_id: 'p' + patronRecord.recordNumber,
                email: patronRecord.emailAddress
            });
        }).catch(reason => {
            callback(reason)
        });
    }).catch(reason => {
        callback(reason);
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
        const nameVarField = extractVarField(data.varFields, 'n');
        const patronName = getPatronName(nameVarField);
        return Object.assign(patronName, {
            recordNumber: data.id,
            barcode: extractVarField(data.varFields, 'b'),
            emailAddress: extractVarField(data.varFields, 'z')
        }
        );
    }

    function extractVarField(varFields, fieldTag) {
        const found = varFields.find(varField => varField.fieldTag === fieldTag);
        return found ? found.content : '';
    }

    function getPatronName(varField) {
        if (!varField.trim()) {
            return {
                title: '',
                firstName: '',
                lastName: ''
            };
        }

        varField = varField.replace('100', '').replace('a|', '').replace('_', '');

        let lastName = '';
        if (varField.includes(',')) {
            lastName = varField.substring(0, varField.indexOf(','));
        }

        let title = '';
        if (varField.includes('|c')) {
            title = varField.substring(varField.indexOf('|c') + 2, varField.indexOf('|b'));
        }

        let firstName = '';
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
