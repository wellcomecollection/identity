import AWS from 'aws-sdk';

const secretsManager = new AWS.SecretsManager();
const ssm = new AWS.SSM();

export async function getSecret<T>(path: string): Promise<T> {
  const secret = await secretsManager
    .getSecretValue({
      SecretId: path,
    })
    .promise();

  if (secret.SecretString) {
    return JSON.parse(secret.SecretString) as T;
  } else {
    throw Error(`Secret ${path} missing!`);
  }
}

export async function getParameter(name: string): Promise<string> {
  const parameterResult = await ssm
    .getParameter({
      Name: name,
    })
    .promise();

  if (parameterResult.Parameter && parameterResult.Parameter.Value) {
    return parameterResult.Parameter.Value;
  } else {
    throw Error(`Parameter ${name} missing!`);
  }
}
