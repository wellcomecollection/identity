'use strict'

exports.handler = function (event, context, callback) {
    var response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: '{\n' +
            '    "page": 0,\n' +
            '    "pageSize": 25,\n' +
            '    "query": "john.doe@example.com",\n' +
            '    "results": [\n' +
            '        {\n' +
            '            "patronId": "123456",\n' +
            '            "barcode": "654321",\n' +
            '            "title": "Mr",\n' +
            '            "firstName": "John",\n' +
            '            "lastName": "Doe",\n' +
            '            "email": "john.doe@example.com",\n' +
            '            "emailValidated": true,\n' +
            '            "locked": false,\n' +
            '            "creationDate": "2020-11-01 00:00:00",\n' +
            '            "lastLogin": "2020-11-01 12:00:00",\n' +
            '            "lastLoginIp": "127.0.0.1",\n' +
            '            "totalLogins": "120"\n' +
            '        }\n' +
            '    ]\n' +
            '}',
    }
    callback(null, response)
}
