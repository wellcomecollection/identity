import { SESv2 } from '@aws-sdk/client-sesv2';
import { Auth0Profile } from '@weco/auth0-client/lib/auth0';
import { APIResponse, successResponse, unhandledError } from '@weco/identity-common';
import { Liquid } from 'liquidjs';
import * as path from 'path';

export default class EmailClient {

  private readonly ses: SESv2 = new SESv2({
    region: 'eu-west-1'
  });
  private readonly engine: Liquid = new Liquid({
    root: path.resolve(__dirname, 'templates/'),
    extname: '.liquid'
  });

  private readonly fromAddress: string;
  private readonly adminAddress: string;

  constructor(fromAddress: string, adminAddress: string) {
    this.fromAddress = fromAddress;
    this.adminAddress = adminAddress;
  }

  async sendDeleteRequestAdmin(auth0Profile: Auth0Profile): Promise<APIResponse<{}>> {
    const subject: string = await this.engine.renderFile('delete-request_admin_subject', {
      userId: auth0Profile.userId
    });
    const body: string = await this.engine.renderFile('delete-request_admin_body', {
      userId: auth0Profile.userId,
      email: auth0Profile.email,
      firstName: auth0Profile.firstName,
      lastName: auth0Profile.lastName
    });
    return this.sendEmail(this.adminAddress, subject, body);
  }

  async sendDeleteRequestUser(auth0Profile: Auth0Profile): Promise<APIResponse<{}>> {
    const subject: string = await this.engine.renderFile('delete-request_user_subject', {});
    const body: string = await this.engine.renderFile('delete-request_user_body', {
      firstName: auth0Profile.firstName,
      lastName: auth0Profile.lastName,
      supportUrl: 'https://wellcome.org/about-us/contact-us'
    });
    return this.sendEmail(auth0Profile.email, subject, body);
  }

  async sendDeleteRemovalUser(auth0Profile: Auth0Profile): Promise<APIResponse<{}>> {
    const subject: string = await this.engine.renderFile('remove-delete-request_user_subject', {});
    const body: string = await this.engine.renderFile('remove-delete-request_user_body', {
      firstName: auth0Profile.firstName,
      lastName: auth0Profile.lastName
    });
    return this.sendEmail(auth0Profile.email, subject, body);
  }

  private async sendEmail(toAddress: string, subject: string, body: string): Promise<APIResponse<{}>> {

    const sesParams = {
      Content: {
        Simple: {
          Subject: {
            Data: subject
          },
          Body: {
            Html: {
              Data: body
            }
          }
        }
      },
      Destination: {
        ToAddresses: [toAddress]
      },
      FromEmailAddress: this.fromAddress
    };

    return this.ses.sendEmail(sesParams).then(result => {
      console.log('Email sent with message ID [' + result.MessageId + ']');
      return successResponse({})
    }).catch(error => {
      console.log('An error occurred sending email [' + sesParams + ']: [' + error + ']');
      return unhandledError(error);
    });
  }
}
