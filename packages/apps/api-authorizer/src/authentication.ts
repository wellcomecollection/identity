// Use these libraries rather than more modern alternatives because they
// are owned/maintained by Auth0
import jwks from 'jwks-rsa';
import jwt, { Jwt, JwtHeader } from 'jsonwebtoken';
import { callbackify } from 'util';

type ValidatorConfig = {
  jwksUri: string;
  resourceServerId: string;
  tokenIssuer: string;
};

export type TokenValidator = (token: string) => Promise<Jwt>;

export const createValidator = ({
  jwksUri,
  resourceServerId,
  tokenIssuer,
}: ValidatorConfig): TokenValidator => {
  const jwksClient = jwks({
    jwksUri,
    cache: true,
    // https://github.com/auth0/node-jwks-rsa#rate-limiting
    rateLimit: true,
  });

  const getPublicKey = callbackify(async (header: JwtHeader) => {
    const key = await jwksClient.getSigningKey(header.kid);
    return key.getPublicKey();
  });

  return (token: string): Promise<Jwt> =>
    // Promisify doesn't get on well with the type overloading that jwt.verify uses
    new Promise((resolve, reject) =>
      jwt.verify(
        token,
        getPublicKey,
        {
          complete: true,
          audience: resourceServerId,
          issuer: tokenIssuer,
        },
        (error, jwt) => {
          if (!error && jwt) {
            return resolve(jwt);
          } else {
            reject(error);
          }
        }
      )
    );
};
