#!/usr/bin/env ts-node-script

import AWS from 'aws-sdk';
import fs from 'fs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const secretsManager = new AWS.SecretsManager();
const ssm = new AWS.SSM();

type Env = 'stage' | 'prod';
type Template = 'universal-login';
const prompts = ['login', 'reset-password', 'email-verification'] as const;
const emails = [
  'verify_email',
  'welcome_email',
  'blocked_account',
  'reset_email',
] as const;

type Prompt = typeof prompts[number];
type Email = typeof emails[number];

const stageApiHost = 'stage.account.wellcomecollection.org';
const prodApiHost = 'account.wellcomecollection.org';

function getApiHost(env: Env) {
  return env === 'stage' ? stageApiHost : prodApiHost;
}

type ClientCredentials = {
  clientId: string;
  clientSecret: string;
};

// This type mirrors the data returned from Auth0
// so does not follow camelCase conventions
type BearerToken = {
  // eslint-disable-next-line camelcase
  access_token: string;
  scope: string;
  // eslint-disable-next-line camelcase
  expires_in: number;
  // eslint-disable-next-line camelcase
  token_type: 'Bearer';
};

function loadPrompt(prompt: Prompt): Record<string, unknown> {
  const data = fs.readFileSync(`prompt/${prompt}.json`, 'utf8');
  const promptData = JSON.parse(data);

  return promptData;
}

function loadHTMLTemplate(templateName: Template): string {
  const data = fs.readFileSync(`templates/${templateName}.html`, 'utf8');

  return data;
}

function loadEmail(emailName: Email): Record<string, unknown> {
  const data = fs.readFileSync(`emails/${emailName}.json`, 'utf8');
  const emailData = JSON.parse(data);
  const emailTemplate = fs.readFileSync(`emails/${emailName}.html`, 'utf8');
  return { ...emailData, body: emailTemplate };
}

async function getParameter(name: string): Promise<string> {
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

async function getSecret<T>(path: string): Promise<T> {
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

async function getAuth0Hostname(env: Env) {
  const hostnameParameterName = `identity-auth0_domain-${env}`;
  return getParameter(hostnameParameterName);
}

async function requestApiToken(
  hostname: string,
  credentials: ClientCredentials
): Promise<BearerToken> {
  const tokenEndpoint = `https://${hostname}/oauth/token`;
  const audience = `https://${hostname}/api/v2/`;

  const tokenRequest = {
    method: 'POST',
    url: tokenEndpoint,
    headers: { 'content-type': 'application/json' },
    data: {
      grant_type: 'client_credentials',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      audience: audience,
    },
  } as AxiosRequestConfig;

  const axiosResult: AxiosResponse<BearerToken> = await axios.request(
    tokenRequest
  );

  return axiosResult.data;
}

async function getApiToken(env: Env) {
  const credentialsLocation = `identity/${env}/buildkite/credentials`;

  const credentials = await getSecret<ClientCredentials>(credentialsLocation);
  const hostname = await getAuth0Hostname(env);
  const bearerToken = await requestApiToken(hostname, credentials);

  return bearerToken;
}

async function updateTextPrompt(env: Env, prompt: Prompt, token: BearerToken) {
  const apiHost = getApiHost(env);
  const language = 'en';

  const promptData = loadPrompt(prompt);
  const textPromptEndpoint = `https://${apiHost}/api/v2/prompts/${prompt}/custom-text/${language}`;

  const promptUpdateRequest = {
    method: 'PUT',
    url: textPromptEndpoint,
    headers: {
      authorization: `Bearer ${token.access_token}`,
      'content-type': 'application/json',
    },
    data: promptData,
  } as AxiosRequestConfig;

  await axios.request(promptUpdateRequest);
}

async function updateLoginPageTemplate(
  env: Env,
  template: Template,
  token: BearerToken
) {
  const apiHost = getApiHost(env);

  const templateData = loadHTMLTemplate(template);
  const templateEndpoint = `https://${apiHost}/api/v2/branding/templates/${template}`;

  const templateUpdateRequest = {
    method: 'PUT',
    url: templateEndpoint,
    headers: {
      authorization: `Bearer ${token.access_token}`,
      'content-type': 'text/html',
    },
    data: templateData,
  } as AxiosRequestConfig;

  await axios.request(templateUpdateRequest);
}

async function updateEmail(env: Env, email: Email, token: BearerToken) {
  const apiHost = getApiHost(env);

  const emailData = loadEmail(email);
  const emailEndpoint = `https://${apiHost}/api/v2/email-templates/${email}`;

  const templateUpdateRequest = {
    method: 'PUT',
    url: emailEndpoint,
    headers: {
      authorization: `Bearer ${token.access_token}`,
      'content-type': 'application/json',
    },
    data: emailData,
  } as AxiosRequestConfig;

  await axios.request(templateUpdateRequest);
}

// TODO: move this somewhere more appropriate than the universal_login dir?
async function updateTenantSettings(env: Env, token: BearerToken) {
  const apiHost = getApiHost(env);
  const tenantSettingsEndpoint = `https://${apiHost}/api/v2/tenants/settings`;

  var options = {
    method: 'PATCH',
    url: tenantSettingsEndpoint,
    headers: {
      authorization: `Bearer ${token.access_token}`,
      'content-type': 'application/json',
      'cache-control': 'no-cache'
    },
    data: '{ "session_lifetime": 168, "idle_session_lifetime": 8 }'
  } as AxiosRequestConfig;

  await axios.request(options);
}

(async () => {
  try {
    const env = process.argv[2] as Env;
    console.log(`Updating environment: ${env}`);

    const token = await getApiToken(env);
    // The non production rate limit of the API end point is 2 requests a second, this ensures we never hit the limit
    const delay = () => new Promise((res) => setTimeout(res, 1000));

    for (const prompt of prompts) {
      await delay();
      console.log(`Updating ${prompt} prompt`);
      await updateTextPrompt(env, prompt, token);
    }

    console.log(`Updating universal-login template`);
    await updateLoginPageTemplate(env, 'universal-login', token);

    for (const email of emails) {
      await delay();
      console.log(`Updating ${email} email`);
      await updateEmail(env, email, token);
    }

    await updateTenantSettings(env, token);

    console.log('Updates completed successfully');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
