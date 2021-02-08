async function enrichPatronAttributes(user, context, callback) {

    const connectionHandlers = {
        'Sierra-Connection': getPatronAttributes,
        'AzureAD-Connection': getAzureAdAttributes
    };

    try {
        const connectionHandler = connectionHandlers[context.connection];
        if (connectionHandler) {
            const idToken = context.idToken || {};
            idToken['https://wellcomecollection.org/'] = await connectionHandler.call(user);
            context.idToken = idToken;
        }
        callback(null, user, context);
    } catch (error) {
        callback(error);
    }

    async function getPatronAttributes() {
        return {
            is_admin: false
        };
    }

    function getAzureAdAttributes() {
        return {
            is_admin: true
        };
    }
}
