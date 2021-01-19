async function enrichPatronAttributes(user, context, callback) {

    const axios = require('axios');

    const apiRoot = configuration.API_ROOT;
    const clientKey = configuration.CLIENT_KEY;
    const clientSecret = configuration.CLIENT_SECRET;

    const namespace = 'https://wellcomecollection.org/';

    try {
        const patronId = user.user_id.substr(7); // TODO This isn't very good?
        const accessToken = await fetchAccessToken();
        const patronRecord = await fetchPatronRecord(accessToken, patronId);

        const idToken = context.idToken || {};
        idToken[namespace] = patronRecord;
        context.idToken = idToken;

        callback(null, user, context);

    } catch (error) {
        callback(error);
    }

    async function fetchAccessToken() {
        return axios.post(apiRoot + '/token', {}, {
            auth: {
                username: clientKey,
                password: clientSecret
            },
            validateStatus: status => status === 200
        }).then(response =>
            response.data.access_token
        );
    }

    async function fetchPatronRecord(accessToken, patronId) {
        return axios.get(apiRoot + '/v6/patrons/' + patronId, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            },
            params: {
                fields: 'varFields'
            },
            validateStatus: status => status === 200
        }).then(response => {
            return {
                record_number: patronId,
                email_address: extractVarField(response.data.varFields, 'z').content,
                barcode: extractVarField(response.data.varFields, 'b').content,
                name: getPatronName(response.data.varFields)
            };
        });
    }

    function extractVarField(varFields, fieldTag) {
        const value = varFields.find(varField => varField.fieldTag === fieldTag);
        if (!value) {
            throw new Error('[' + fieldTag + '] not found in varFields [' + varFields + ']');
        }
        return value;
    }

    function getPatronName(varFields) {
        const found = extractVarField(varFields, 'n');
        if (found && found.content) {
            return getPatronNameNonMarc(found.content);
        } else if (found && found.subfields) {
            return getPatronNameMarc(found.subfields);
        } else {
            return '';
        }
    }

    function getPatronNameMarc(subFields) {
        const firstName = subFields.find(subField => subField.tag === 'b');
        const lastName = subFields.find(subField => subField.tag === 'a');
        return (firstName ? firstName.content.trim() : '') + ' ' + (lastName ? lastName.content.trim() : '');
    }

    function getPatronNameNonMarc(content) {
        if (!content.trim()) {
            return '';
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

        return firstName.trim() + ' ' + lastName.trim();
    }
}
