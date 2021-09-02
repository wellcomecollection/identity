import { PatronRecord, SierraClient } from '../src';
import {
  errorResponse,
  ResponseStatus,
  successResponse,
} from '@weco/identity-common';

export default class MockSierraClient implements SierraClient {
  private patrons: Map<number, PatronRecord> = new Map();
  private passwords: Map<number, string | undefined> = new Map();

  reset = () => {
    this.patrons.clear();
    this.passwords.clear();
  };

  addPatron = (patron: PatronRecord, password?: string) => {
    this.patrons.set(patron.recordNumber, patron);
    this.passwords.set(patron.recordNumber, password);
  };

  contains = (userId: number) => this.patrons.has(userId);

  static randomPatronRecord = (
    firstName?: string,
    lastName?: string
  ): PatronRecord => ({
    recordNumber: Math.floor(Math.random() * 1e8),
    barcode: Math.floor(Math.random() * 1e8).toString(),
    firstName: firstName ?? 'Test',
    lastName: lastName ?? 'Patron',
    email: 'test@patron.com',
  });

  createPatronRecord = jest.fn(async (firstName, lastName, pin) => {
    const patron = MockSierraClient.randomPatronRecord(firstName, lastName);
    this.patrons.set(patron.recordNumber, patron);
    this.passwords.set(patron.recordNumber, pin);
    return successResponse(patron.recordNumber);
  });

  deletePatronRecord = jest.fn(async (recordNumber) => {
    this.patrons.delete(recordNumber);
    this.passwords.delete(recordNumber);
    return successResponse({});
  });

  getPatronRecordByBarcode = jest.fn(async (barcode) => {
    for (const patron of this.patrons.values()) {
      if (patron.barcode === barcode) {
        return successResponse(patron);
      }
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  getPatronRecordByEmail = jest.fn(async (email) => {
    for (const patron of this.patrons.values()) {
      if (patron.email === email) {
        return successResponse(patron);
      }
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  getPatronRecordByRecordNumber = jest.fn(async (recordNumber) => {
    const maybePatron = this.patrons.get(recordNumber);
    return maybePatron
      ? successResponse(maybePatron)
      : errorResponse('Not found', ResponseStatus.NotFound);
  });

  updatePassword = jest.fn(async (recordNumber, password) => {
    const maybePatron = this.patrons.get(recordNumber);
    if (maybePatron) {
      this.passwords.set(recordNumber, password);
      return successResponse(maybePatron);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  updatePatronPostCreationFields = jest.fn(async (recordNumber, email) => {
    const maybePatron = this.patrons.get(recordNumber);
    if (maybePatron) {
      const updatedPatron = {
        ...maybePatron,
        email,
        barcode: recordNumber.toString(),
      };
      this.patrons.set(recordNumber, updatedPatron);
      return successResponse(updatedPatron);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  updatePatronRecord = jest.fn(async (recordNumber, email) => {
    const maybePatron = this.patrons.get(recordNumber);
    if (maybePatron) {
      const updatedPatron = {
        ...maybePatron,
        email,
      };
      this.patrons.set(recordNumber, updatedPatron);
      return successResponse(updatedPatron);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  validateCredentials = jest.fn(async (barcode, password) => {
    for (const patron of this.patrons.values()) {
      if (
        patron.barcode === barcode &&
        this.passwords.get(patron.recordNumber) === password
      ) {
        return successResponse({});
      }
    }
    return errorResponse('Not found', ResponseStatus.InvalidCredentials);
  });
}
