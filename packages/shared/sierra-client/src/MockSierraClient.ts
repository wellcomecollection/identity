import { PatronRecord, SierraClient } from '../src';
import {
  APIResponse,
  errorResponse,
  ResponseStatus,
  successResponse,
} from '@weco/identity-common';
import { Role, UpdateOptions } from './patron';
import { getPatronName } from './marc';

export default class MockSierraClient implements SierraClient {
  private patrons: Map<number, PatronRecord> = new Map();
  private passwords: Map<number, string | undefined> = new Map();
  private deletions: Map<number, Date> = new Map();

  get = (recordNumber: number) => this.patrons.get(recordNumber);
  getPassword = (recordNumber: number) => this.passwords.get(recordNumber);
  markDeleted = (recordNumber: number, deletedDate: Date) =>
    this.deletions.set(recordNumber, deletedDate);

  reset = () => {
    this.patrons.clear();
    this.passwords.clear();
  };

  addPatron = (patron: PatronRecord, password?: string, deletedDate?: Date) => {
    this.patrons.set(patron.recordNumber, patron);
    this.passwords.set(patron.recordNumber, password);
    if (deletedDate) {
      this.deletions.set(patron.recordNumber, deletedDate);
    }
  };

  contains = (userId: number) => this.patrons.has(userId);

  static randomPatronRecord = (
    firstName?: string,
    lastName?: string,
    role?: Role
  ): PatronRecord => ({
    recordNumber: Math.floor(Math.random() * 1e8),
    barcode: Math.floor(Math.random() * 1e8).toString(),
    firstName: firstName ?? 'Test',
    lastName: lastName ?? 'Patron',
    email: 'test' + Math.floor(Math.random() * 100).toString() + '@patron',
    role: role ?? 'Reader',
    createdDate: new Date(),
  });

  getPatronRecordByEmail = jest.fn(async (email: string) => {
    for (const patron of this.patrons.values()) {
      if (patron.email === email) {
        return successResponse(patron);
      }
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  getDeletedRecordNumbers = jest.fn(
    async ({
      start,
      end,
    }: {
      start?: Date;
      end?: Date;
    } = {}): Promise<APIResponse<number[]>> => {
      const deletions = this.deletions.entries();
      function* filteredDeletions() {
        for (const [recordNumber, deletedDate] of deletions) {
          if (
            (!start || deletedDate.getTime() >= start.getTime()) &&
            (!end || deletedDate.getTime() <= end.getTime())
          ) {
            yield recordNumber;
          }
        }
      }
      return successResponse(Array.from(filteredDeletions()));
    }
  );

  getPatronRecordByRecordNumber = jest.fn(async (recordNumber: number) => {
    const maybePatron = this.patrons.get(recordNumber);
    return maybePatron
      ? successResponse(maybePatron)
      : errorResponse('Not found', ResponseStatus.NotFound);
  });

  updatePatron = jest.fn(
    async (recordNumber: number, options: UpdateOptions) => {
      const maybePatron = this.patrons.get(recordNumber);
      if (maybePatron) {
        this.passwords.set(recordNumber, options.pin);

        let firstName = maybePatron.firstName;
        let lastName = maybePatron.lastName;

        if (options.varFields) {
          const name = getPatronName(options.varFields);
          firstName = name.firstName;
          lastName = name.lastName;
        }

        const updatedPatron = {
          ...maybePatron,
          firstName,
          lastName,
          varFields: options.varFields,
        };
        this.patrons.set(recordNumber, updatedPatron);

        return successResponse(updatedPatron);
      }
      return errorResponse('Not found', ResponseStatus.NotFound);
    }
  );

  updatePatronEmail = jest.fn(
    async (recordNumber: number, email: string, verified: boolean = false) => {
      const maybePatron = this.patrons.get(recordNumber);
      if (maybePatron) {
        const updatedPatron = {
          ...maybePatron,
          email,
          verifiedEmail: verified ? email : maybePatron.verifiedEmail,
        };
        this.patrons.set(recordNumber, updatedPatron);
        return successResponse(updatedPatron);
      }
      return errorResponse('Not found', ResponseStatus.NotFound);
    }
  );

  markPatronEmailVerified = jest.fn(async (recordNumber: number) => {
    const maybePatron = this.patrons.get(recordNumber);
    if (maybePatron) {
      const updatedPatron = {
        ...maybePatron,
        verifiedEmail: maybePatron.email,
      };
      this.patrons.set(recordNumber, updatedPatron);
      return successResponse(updatedPatron);
    }
    return errorResponse('Not found', ResponseStatus.NotFound);
  });

  createPatron = jest.fn(
    async (lastName: string, email: string, firstName: string) => {
      const newPatronRecord = (
        firstName: string,
        lastName: string,
        role?: Role
      ): PatronRecord => ({
        recordNumber: Math.floor(Math.random() * 1e8),
        barcode: Math.floor(Math.random() * 1e8).toString(),
        firstName,
        lastName,
        email,
        role: role ?? 'Reader',
        createdDate: new Date(),
      });

      const patron = newPatronRecord('Ravi', 'Ravioli', 'SelfRegistered');
      this.addPatron(patron);
      return successResponse({ recordNumber: patron.recordNumber });
    }
  );

  validateCredentials = jest.fn(async (barcode: string, password: string) => {
    for (const patron of this.patrons.values()) {
      if (
        patron.barcode === barcode &&
        this.passwords.get(patron.recordNumber) === password
      ) {
        return successResponse({});
      }
    }
    return errorResponse(
      'Invalid credentials',
      ResponseStatus.InvalidCredentials
    );
  });
}
