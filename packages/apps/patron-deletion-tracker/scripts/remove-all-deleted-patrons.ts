import { getCreds } from '@weco/ts-aws';
import { Lambda } from '@aws-sdk/client-lambda';
import { fromUtf8 } from '@aws-sdk/util-utf8-node';
import yargs from 'yargs/yargs';
import ora from 'ora';

// Only check for deletions after this date - this will include all Patrons that have ever been imported into Auth0
const startDate = new Date('2022-01-01T00:00:00.000Z');

type Options = {
  environment: 'stage' | 'prod';
  dryRun?: boolean;
};

const removeAllDeletedPatrons = async ({ environment, dryRun }: Options) => {
  const credentials = await getCreds('identity', 'developer');
  const lambdaClient = new Lambda({ credentials });

  const spinner = ora('Invoking patron deletion lambda').start();
  try {
    const lambdaResult = await lambdaClient.invoke({
      FunctionName: `patron-deletion-tracker-${environment}`,
      Payload: fromUtf8(
        JSON.stringify({
          window: {
            start: startDate.toISOString(),
            end: new Date().toISOString(),
          },
          dryRun: Boolean(dryRun),
        })
      ),
    });
    if (lambdaResult.StatusCode === 200) {
      spinner.succeed('Invocation succeeded');
      console.log(
        'Note: this does not necessarily mean the Lambda itself succeeded.'
      );
      console.log('Check the Lambda logs for more information.');
    } else {
      spinner.fail('Invocation failed');
    }
  } catch (e) {
    spinner.fail('Invocation failed');
    console.error(e);
  }
};

const argv = yargs(process.argv.slice(2)).options({
  environment: { choices: ['stage', 'prod'] as const, default: 'stage' },
  dryRun: { type: 'boolean', default: false },
}).argv;

removeAllDeletedPatrons(argv as Options);
