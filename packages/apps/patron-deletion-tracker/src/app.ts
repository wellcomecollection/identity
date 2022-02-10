import { ScheduledHandler } from 'aws-lambda';

export const lambdaHandler: ScheduledHandler = async (event) => {
  console.log('I am a Patron deletion tracker');
};
