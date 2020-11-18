import SierraClient from "@weco/sierra-client";

export default async function login(email: string, password: string, callback: any): Promise<void> {

  const apiRoot = configuration.API_ROOT;
  const clientKey = configuration.CLIENT_KEY;
  const clientSecret = configuration.CLIENT_SECRET;

  try {
    const sierraClient = new SierraClient(apiRoot, clientKey, clientSecret);

    const patronRecord = await sierraClient.getPatronRecordByEmail(email).then(patronRecord => {
      return sierraClient.validateCredentials(patronRecord.barcode, password);
    });

    callback(null, {
      user_id: 'p' + patronRecord.recordNumber,
      email: patronRecord.emailAddress
    });
  } catch (error) {
    callback(error);
  }
}
