import SierraClient from "@weco/sierra-client";

export default async function getUser(email: string, callback: any): Promise<void> {

  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  try {
    const patronRecord = await new SierraClient(apiRoot, clientKey, clientSecret).getPatronRecordByEmail(email);

    callback(null, {
      user_id: 'p' + patronRecord.recordNumber,
      email: patronRecord.emailAddress
    });
  } catch (error) {
    callback(error);
  }
}
