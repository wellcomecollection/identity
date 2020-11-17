import getPatronRecord from '@weco/sierra-client';

export default async function getUser(email: string, callback: any) {
    const record = await getPatronRecord(email);
}
