import { APIResponse } from '@weco/identity-common';
import { PatronRecord } from './patron';

export default interface SierraClient {
  validateCredentials(
    barcode: string,
    password: string
  ): Promise<APIResponse<{}>>;

  getPatronRecordByRecordNumber(
    recordNumber: number
  ): Promise<APIResponse<PatronRecord>>;
  getPatronRecordByEmail(email: string): Promise<APIResponse<PatronRecord>>;

  updatePatronRecord(
    recordNumber: number,
    email: string
  ): Promise<APIResponse<PatronRecord>>;

  updatePassword(
    recordNumber: number,
    password: string
  ): Promise<APIResponse<PatronRecord>>;
}
