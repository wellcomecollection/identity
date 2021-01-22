async function enrichPatronAttributes(user, context, callback) {

    const axios = require('axios');

    const apiRoot = configuration.API_ROOT;
    const clientKey = configuration.CLIENT_KEY;
    const clientSecret = configuration.CLIENT_SECRET;

    const namespace = 'https://wellcomecollection.org/';

    try {
        if(context.connection === 'Sierra-Connection' && requestContainsScope(context.request)) {
            const patronId = user.user_id.substr(7); // TODO This isn't very good?
            const accessToken = await fetchAccessToken();
            const patronRecord = await fetchPatronRecord(accessToken, patronId);

            const idToken = context.idToken || {};
            idToken[namespace] = {
                record_number: patronRecord.recordNumber,
                barcode: patronRecord.barcode,
                email: patronRecord.email,
                name: patronRecord.firstName + ' ' + patronRecord.lastName,
                first_names: patronRecord.firstName,
                last_names: patronRecord.lastName
            };
            context.idToken = idToken;
        }

        callback(null, user, context);

    } catch (error) {
        callback(error);
    }

    function requestContainsScope(request) {
        const match = request.query.scope.match(/\bpatron:read\b/);
        return !match || match.length !== 1 ? null : match[0];
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
            return toPatronRecord(response.data);
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
            };
        }
    }

    function getPatronNameMarc(subFields) {
        const firstName = subFields.find(subField => subField.tag === 'b');
        const lastName = subFields.find(subField => subField.tag === 'a');
        return {
            firstName: firstName ? firstName.content.trim() : '',
            lastName: lastName ? lastName.content.trim() : ''
        };
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
