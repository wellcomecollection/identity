import { IAuth0RuleContext, IAuth0RuleUser } from '@tepez/auth0-rules-types';

export type EmptyUser = IAuth0RuleUser<{}, {}>;

async function getPatronAttributes() {
  return {
    is_admin: false,
  };
}

async function getAzureAdAttributes() {
  return {
    is_admin: true,
  };
}

const connectionHandlers = {
  'Sierra-Connection': getPatronAttributes,
  'AzureAD-Connection': getAzureAdAttributes,
};

function isEnrichableConnection(
  connection: string
): connection is keyof typeof connectionHandlers {
  return connection in connectionHandlers;
}

async function doEnrichPatronAttributes(
  user: EmptyUser,
  context: IAuth0RuleContext
): Promise<[EmptyUser, IAuth0RuleContext]> {
  if (isEnrichableConnection(context.connection)) {
    const connectionHandler = connectionHandlers[context.connection];
    const idToken = context.idToken || {};
    idToken['https://wellcomecollection.org/'] = await connectionHandler.call(
      user
    );
    context.idToken = idToken;
  }
  return [user, context];
}

export default function enrichPatronAttributes(
  user: EmptyUser,
  context: IAuth0RuleContext,
  callback: (error: any, user?: EmptyUser, context?: IAuth0RuleContext) => void
) {
  doEnrichPatronAttributes(user, context)
    .then(([nextUser, nextContext]) => callback(null, nextUser, nextContext))
    .catch((error) => callback(error));
}
