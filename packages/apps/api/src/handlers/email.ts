import { Auth0Profile } from "@weco/auth0-client/lib/auth0";
import { AWSError, SESV2 } from "aws-sdk";
import { SendEmailResponse } from "aws-sdk/clients/sesv2";
import { Liquid } from "liquidjs";
import * as path from "path";

export default class EmailClient {

  private readonly ses: SESV2 = new SESV2();
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

  async sendDeleteRequestAdmin(auth0Profile: Auth0Profile): Promise<void> {
    const subject: string = await this.engine.renderFile('delete-request_admin_subject', {
      userId: auth0Profile.userId
    });
    const body: string = await this.engine.renderFile('delete-request_admin_body', {
      userId: auth0Profile.userId,
      email: auth0Profile.email,
      firstName: auth0Profile.firstName,
      lastName: auth0Profile.lastName
    });
    this.sendEmail(this.adminAddress, subject, body);
  }

  async sendDeleteRequestUser(auth0Profile: Auth0Profile): Promise<void> {
    const subject: string = await this.engine.renderFile('delete-request_user_subject', {});
    const body: string = await this.engine.renderFile('delete-request_user_body', {
      firstName: auth0Profile.firstName,
      lastName: auth0Profile.lastName
    });
    this.sendEmail(auth0Profile.email, subject, body);
  }

  private sendEmail(toAddress: string, subject: string, body: string): void {

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

    const sesCallback: (error: AWSError, data: SendEmailResponse) => void = function (error: AWSError, data: SendEmailResponse): void {
      if (error) {
        console.log(error, error.stack);
      } else {
        console.log(data);
      }
    }

    this.ses.sendEmail(sesParams, sesCallback);
  }
}
