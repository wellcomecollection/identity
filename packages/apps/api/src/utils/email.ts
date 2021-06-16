import { Auth0Profile } from '@weco/auth0-client';
import {
  APIResponse,
  successResponse,
  unhandledError,
} from '@weco/identity-common';
import { Liquid } from 'liquidjs';
import * as nodemailer from 'nodemailer';
import Mail, { Options } from 'nodemailer/lib/mailer';
import * as path from 'path';

export interface SmtpConfiguration {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export default class EmailClient {
  private readonly engine: Liquid = new Liquid({
    root: path.resolve(__dirname, 'templates/'),
    extname: '.liquid',
  });

  private readonly smtp: Mail;
  private readonly fromAddress: string;
  private readonly adminAddress: string;
  private readonly supportUrl: string;

  constructor(
    smtpConfiguration: SmtpConfiguration,
    fromAddress: string,
    adminAddress: string,
    supportUrl: string
  ) {
    this.smtp = nodemailer.createTransport(smtpConfiguration);
    this.fromAddress = fromAddress;
    this.adminAddress = adminAddress;
    this.supportUrl = supportUrl;
  }

  async sendDeleteRequestAdmin(
    auth0Profile: Auth0Profile
  ): Promise<APIResponse<{}>> {
    const subject: string = await this.engine.renderFile(
      'delete-request_admin_subject',
      {
        userId: auth0Profile.userId,
      }
    );
    const body: string = await this.engine.renderFile(
      'delete-request_admin_body',
      {
        userId: auth0Profile.userId,
        email: auth0Profile.email,
        firstName: auth0Profile.firstName,
        lastName: auth0Profile.lastName,
      }
    );
    return this.sendEmail(this.adminAddress, subject, body);
  }

  async sendDeleteRequestUser(
    auth0Profile: Auth0Profile
  ): Promise<APIResponse<{}>> {
    const subject: string = await this.engine.renderFile(
      'delete-request_user_subject',
      {}
    );
    const body: string = await this.engine.renderFile(
      'delete-request_user_body',
      {
        firstName: auth0Profile.firstName,
        lastName: auth0Profile.lastName,
        supportUrl: this.supportUrl,
      }
    );
    return this.sendEmail(auth0Profile.email, subject, body);
  }

  async sendDeleteRemovalUser(
    auth0Profile: Auth0Profile
  ): Promise<APIResponse<{}>> {
    const subject: string = await this.engine.renderFile(
      'remove-delete-request_user_subject',
      {}
    );
    const body: string = await this.engine.renderFile(
      'remove-delete-request_user_body',
      {
        firstName: auth0Profile.firstName,
        lastName: auth0Profile.lastName,
      }
    );
    return this.sendEmail(auth0Profile.email, subject, body);
  }

  protected async sendEmail(
    toAddress: string,
    subject: string,
    body: string
  ): Promise<APIResponse<{}>> {
    const smtpParams: Options = {
      from: this.fromAddress,
      to: toAddress,
      subject: subject,
      html: body,
    };

    return this.smtp
      .sendMail(smtpParams)
      .then((result) => {
        console.log(`SMTP Email sent with message ID [${result.messageId}]`);
        return successResponse({});
      })
      .catch((error) => {
        console.error(
          `An error occurred sending SMTP email [${smtpParams}]`,
          error
        );
        return unhandledError(error);
      });
  }
}
