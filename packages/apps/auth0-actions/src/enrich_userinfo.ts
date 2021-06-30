async function getPatronAttributes() {
  return {
    is_admin: false,
  };
}

function getAzureAdAttributes() {
  return {
    is_admin: true,
  };
}

async function doEnrichPatronAttributes(user, context) {
  const connectionHandlers = {
    'Sierra-Connection': getPatronAttributes,
    'AzureAD-Connection': getAzureAdAttributes,
  };

  const connectionHandler = connectionHandlers[context.connection];
  if (connectionHandler) {
    const idToken = context.idToken || {};
    idToken['https://wellcomecollection.org/'] = await connectionHandler.call(
      user
    );
    context.idToken = idToken;
  }
  return [user, context];
}

export default function enrichPatronAttributes(user, context, callback) {
  doEnrichPatronAttributes(user, context)
    .then(([nextUser, nextContext]) => callback(null, nextUser, nextContext))
    .catch((error) => callback(error));
}
