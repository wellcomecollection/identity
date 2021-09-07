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
  getPatronRecordByBarcode(barcode: string): Promise<APIResponse<PatronRecord>>;
  getPatronRecordByEmail(email: string): Promise<APIResponse<PatronRecord>>;

  createPatronRecord(
    firstName: string,
    lastName: string,
    pin: string
  ): Promise<APIResponse<number>>;
  updatePatronRecord(
    recordNumber: number,
    email: string
  ): Promise<APIResponse<PatronRecord>>;
  deletePatronRecord(recordNumber: number): Promise<APIResponse<{}>>;

  updatePatronPostCreationFields(
    recordNumber: number,
    email: string
  ): Promise<APIResponse<PatronRecord>>;
  updatePassword(
    recordNumber: number,
    password: string
  ): Promise<APIResponse<PatronRecord>>;
}
