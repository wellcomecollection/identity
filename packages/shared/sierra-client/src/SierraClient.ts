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

  updatePatronEmail(
    recordNumber: number,
    email: string,
    verified: boolean
  ): Promise<APIResponse<PatronRecord>>;

  markPatronEmailVerified(
    recordNumber: number,
    verificationWasAssumed?: boolean
  ): Promise<APIResponse<PatronRecord>>;

  deleteOldVerificationNotes(
    recordNumber: number
  ): Promise<APIResponse<PatronRecord>>;

  updatePassword(
    recordNumber: number,
    password: string
  ): Promise<APIResponse<PatronRecord>>;
}
