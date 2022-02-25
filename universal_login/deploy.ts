#!/usr/bin/env ts-node-script
import fs from 'fs';
import { AxiosInstance } from 'axios';
import { RateLimiter } from 'limiter';
import { getAuthenticatedInstance } from './scripts/auth0-management';

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

// For the non-production tenant the management API is limited to (in the worst case)
// 2 req/second - this ensures we never hit that
// https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy/management-api-endpoint-rate-limits
const rateLimiter = new RateLimiter({
  tokensPerInterval: 2,
  interval: 'second',
});

const doDeploy = async () => {
  try {
    const env = process.argv[2] as 'stage' | 'prod';
    console.log(`Updating environment: ${env}`);

    const axiosInstance = await getAuthenticatedInstance(env);

    for (const prompt of prompts) {
      await rateLimiter.removeTokens(1);
      console.log(`Updating ${prompt} prompt`);
      await updateTextPrompt(axiosInstance, prompt);
    }

    console.log(`Updating universal-login template`);
    await rateLimiter.removeTokens(1);
    await updateLoginPageTemplate(axiosInstance, 'universal-login');

    for (const email of emails) {
      await rateLimiter.removeTokens(1);
      console.log(`Updating ${email} email`);
      await updateEmail(axiosInstance, email);
    }

    console.log('Updates completed successfully');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
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

function updateTextPrompt(
  instance: AxiosInstance,
  prompt: Prompt
): Promise<void> {
  const language = 'en';
  const promptData = loadPrompt(prompt);
  const textPromptEndpoint = `/api/v2/prompts/${prompt}/custom-text/${language}`;

  return instance.put(textPromptEndpoint, { data: promptData });
}

function updateLoginPageTemplate(
  instance: AxiosInstance,
  template: Template
): Promise<void> {
  const templateData = loadHTMLTemplate(template);
  const templateEndpoint = `/api/v2/branding/templates/${template}`;

  return instance.put(templateEndpoint, { data: templateData });
}

async function updateEmail(
  instance: AxiosInstance,
  email: Email
): Promise<void> {
  const emailData = loadEmail(email);
  const emailEndpoint = `/api/v2/email-templates/${email}`;

  return instance.put(emailEndpoint, { data: emailData });
}

doDeploy();
