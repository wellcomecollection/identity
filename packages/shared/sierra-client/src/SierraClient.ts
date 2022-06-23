import { APIResponse } from '@weco/identity-common';
import { PatronCreateResponse, PatronRecord, UpdateOptions } from './patron';
import { NoteOptions } from './email-verification-notes';

export default interface SierraClient {
  validateCredentials(
    barcode: string,
    password: string
  ): Promise<APIResponse<{}>>;

  createPatron(
    lastName: string,
    email: string,
    firstName: string,
    password: string
  ): Promise<APIResponse<PatronCreateResponse>>;

  getDeletedRecordNumbers(options?: {
    start?: Date;
    end?: Date;
  }): Promise<APIResponse<number[]>>;

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
    options?: NoteOptions
  ): Promise<APIResponse<PatronRecord>>;

  updatePatron(
    recordNumber: number,
    options?: UpdateOptions
  ): Promise<APIResponse<PatronRecord>>;
}
