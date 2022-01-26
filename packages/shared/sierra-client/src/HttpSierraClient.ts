import axios from 'axios';
import {
  APIResponse,
  authenticatedInstanceFactory,
  errorResponse,
  ResponseStatus,
  successResponse,
  unhandledError,
} from '@weco/identity-common';
import { PatronRecord, PatronResponse, toPatronRecord } from './patron';
import SierraClient from './SierraClient';
import {
  addVerificationNote,
  deleteOldVerificationNotes,
} from './email-verification-notes';

export default class HttpSierraClient implements SierraClient {
  private readonly apiRoot: string;
  private readonly clientKey: string;
  private readonly clientSecret: string;

  constructor(apiRoot: string, clientKey: string, clientSecret: string) {
    this.apiRoot = apiRoot;
    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
  }

  async validateCredentials(
    barcode: string,
    password: string
  ): Promise<APIResponse<{}>> {
    return this.getInstance().then((instance) => {
      return instance
        .post(
          // https://sandbox.iii.com/iii/sierra-api/swagger/index.html#!/patrons/validate_patron_credentials_post_2
          '/patrons/auth',
          {
            authMethod: 'native',
            // Despite the naming and the docs, this does actually need to be the barcode
            // rather than the record number / ID
            patronId: barcode,
            patronSecret: password,
          },
          {
            validateStatus: (status) => status === 200,
          }
        )
        .then(() => successResponse({}))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400:
                return errorResponse(
                  'Invalid Patron credentials for barcode [' + barcode + ']',
                  ResponseStatus.InvalidCredentials,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  async getPatronRecordByRecordNumber(
    recordNumber: number
  ): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then((instance) => {
      return instance
        .get('/patrons/' + recordNumber, {
          params: {
            fields: 'varFields,deleted,patronType',
          },
          validateStatus: (status) => status === 200,
        })
        .then((response) => {
          if (!response.data.deleted) {
            return successResponse(toPatronRecord(response.data));
          } else {
            return errorResponse(
              'Patron record with record number [' +
                recordNumber +
                '] is deleted',
              ResponseStatus.NotFound
            );
          }
        })
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 404:
                return errorResponse(
                  'Patron record with record number [' +
                    recordNumber +
                    '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  async getPatronRecordByEmail(
    email: string
  ): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then((instance) => {
      // Varfield tag 'z' is used for the patron's email address
      // See https://documentation.iii.com/sierrahelp/Default.htm#sril/sril_records_varfld_types_patron.html
      return instance
        .get('/patrons/find', {
          params: {
            varFieldTag: 'z',
            varFieldContent: email.toLowerCase(),
            fields: 'varFields,patronType',
          },
          validateStatus: (status) => status === 200,
        })
        .then((response) => successResponse(toPatronRecord(response.data)))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 404:
                return errorResponse(
                  'Patron record with email address [' + email + '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  async updatePatronEmail(
    recordNumber: number,
    email: string,
    verified: boolean = false
  ): Promise<APIResponse<PatronRecord>> {
    try {
      const instance = await this.getInstance();
      const currentRecordResponse = await instance.get<PatronResponse>(
        `/patrons/${recordNumber}`,
        {
          params: { fields: 'varFields' },
          validateStatus: (status) => status === 200,
        }
      );

      const updatedVarFields = verified
        ? addVerificationNote(currentRecordResponse.data.varFields)
        : currentRecordResponse.data.varFields;

      await instance.put(
        '/patrons/' + recordNumber,
        {
          emails: [email],
          varFields: updatedVarFields,
        },
        {
          validateStatus: (status) => status === 204,
        }
      );

      return this.getPatronRecordByRecordNumber(recordNumber);
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            return errorResponse(
              'Malformed or invalid Patron record update request',
              ResponseStatus.MalformedRequest,
              error
            );
          case 404:
            return errorResponse(
              'Patron record with record number [' +
                recordNumber +
                '] not found',
              ResponseStatus.NotFound,
              error
            );
        }
      }
      return unhandledError(error);
    }
  }

  async markPatronEmailVerified(
    recordNumber: number,
    verificationWasAssumed: boolean = false
  ): Promise<APIResponse<PatronRecord>> {
    try {
      const instance = await this.getInstance();
      const currentRecordResponse = await instance.get<PatronResponse>(
        `/patrons/${recordNumber}`,
        {
          params: { fields: 'varFields' },
          validateStatus: (status) => status === 200,
        }
      );

      const updatedVarFields = addVerificationNote(
        currentRecordResponse.data.varFields,
        verificationWasAssumed
      );

      await instance.put(
        '/patrons/' + recordNumber,
        {
          varFields: updatedVarFields,
        },
        {
          validateStatus: (status) => status === 204,
        }
      );

      return successResponse(
        toPatronRecord({
          ...currentRecordResponse.data,
          varFields: updatedVarFields,
        })
      );
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 404:
            return errorResponse(
              'Patron record with record number [' +
                recordNumber +
                '] not found',
              ResponseStatus.NotFound,
              error
            );
        }
      }
      return unhandledError(error);
    }
  }

  async deleteOldVerificationNotes(
    recordNumber: number
  ): Promise<APIResponse<PatronRecord>> {
    try {
      const instance = await this.getInstance();
      const currentRecordResponse = await instance.get<PatronResponse>(
        `/patrons/${recordNumber}`,
        {
          params: { fields: 'varFields' },
          validateStatus: (status) => status === 200,
        }
      );

      const updatedVarFields = deleteOldVerificationNotes(
        currentRecordResponse.data.varFields
      );

      await instance.put(
        '/patrons/' + recordNumber,
        {
          varFields: updatedVarFields,
        },
        {
          validateStatus: (status) => status === 204,
        }
      );

      return successResponse(
        toPatronRecord({
          ...currentRecordResponse.data,
          varFields: updatedVarFields,
        })
      );
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 404:
            return errorResponse(
              'Patron record with record number [' +
                recordNumber +
                '] not found',
              ResponseStatus.NotFound,
              error
            );
        }
      }
      return unhandledError(error);
    }
  }

  async updatePassword(
    recordNumber: number,
    password: string
  ): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then((instance) => {
      return instance
        .put(
          '/patrons/' + recordNumber,
          {
            pin: password,
          },
          {
            validateStatus: (status) => status === 204,
          }
        )
        .then(() => this.getPatronRecordByRecordNumber(recordNumber))
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400:
                // I think this is referring to API error code 136 "PIN is not valid"
                // See https://techdocs.iii.com/sierraapi/Content/zReference/errorHandling.htm
                // TODO: Check this is what's being tested here.
                // TODO: What is specificCode == 3 for?
                if (
                  error.response.data?.code === 136 &&
                  error.response.data?.specificCode === 3
                ) {
                  return errorResponse(
                    'Password does not meet Sierra policy',
                    ResponseStatus.PasswordTooWeak,
                    error
                  );
                } else {
                  return errorResponse(
                    'Malformed or invalid Patron record update request',
                    ResponseStatus.MalformedRequest,
                    error
                  );
                }
              case 404:
                return errorResponse(
                  'Patron record with record number [' +
                    recordNumber +
                    '] not found',
                  ResponseStatus.NotFound,
                  error
                );
            }
          }
          return unhandledError(error);
        });
    });
  }

  private getInstance = authenticatedInstanceFactory(
    async () => {
      const response = await axios.post(
        this.apiRoot + '/token',
        {},
        {
          auth: {
            username: this.clientKey,
            password: this.clientSecret,
          },
          validateStatus: (status) => status === 200,
        }
      );
      return {
        accessToken: response.data.access_token,
        expiresAt: Math.floor(Date.now() / 1000) + response.data.expires_in,
      };
    },
    () => ({ baseURL: `${this.apiRoot}/v6` })
  );
}
