import axios from 'axios';
import {
  APIResponse,
  authenticatedInstanceFactory,
  errorResponse,
  ResponseStatus,
  successResponse,
  unhandledError,
} from '@weco/identity-common';
import {
  PatronRecord,
  PatronResponse,
  PatronCreateResponse,
  toPatronRecord,
  varFieldTags,
} from './patron';
import SierraClient from './SierraClient';
import {
  updateVerificationNote,
  NoteOptions,
} from './email-verification-notes';
import { paginatedSierraResults } from './pagination';

const minimumPatronFields = ['varFields', 'patronType'];

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

  async createPatron(
    lastName: string,
    firstName: string,
    email: string
  ): Promise<APIResponse<PatronCreateResponse>> {
    return this.getInstance().then(async (instance) => {
      try {
        const response = await instance.post('/patrons/', {
          // Create the patron in marc format
          params: {
            varFields: [
              {
                fieldTag: 'n',
                marcTag: '100',
                ind1: ' ',
                ind2: ' ',
                subfields: [
                  {
                    tag: 'a',
                    content: lastName,
                  },
                  {
                    tag: 'b',
                    content: firstName,
                  },
                ],
              },
              {
                fieldTag: 'z',
                content: email.toLocaleLowerCase(),
              },
              // TODO: Discuss with library staff to make sure this field being more specific is useful
              // or if we add another fieldTag type to best express the type of registration
              {
                fieldTag: 'm',
                content: 's',
              },
            ],
          },
          validateStatus: (status: number) => status === 200,
        });
        // A successful patron creation POST results in a url link to patron
        return successResponse(response.data);
      } catch (error) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              return errorResponse(
                'Malformed or invalid Patron creation request',
                ResponseStatus.MalformedRequest,
                error
              );
          }
        }
        return unhandledError(error);
      }
    });
  }

  async getPatronRecordByRecordNumber(
    recordNumber: number
  ): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then((instance) => {
      return instance
        .get('/patrons/' + recordNumber, {
          params: {
            fields: [...minimumPatronFields, 'deleted'].join(','),
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

  async getDeletedRecordNumbers({
    start,
    end,
  }: {
    start?: Date;
    end?: Date;
  } = {}): Promise<APIResponse<number[]>> {
    try {
      const instance = await this.getInstance();
      const startDateString = start?.toISOString().slice(0, 10);
      const endDateString = (end ?? new Date()).toISOString().slice(0, 10);

      const deletedDate = startDateString
        ? `[${startDateString},${endDateString}]`
        : undefined;

      const entries = await paginatedSierraResults<{ id: number }>(
        {
          url: '/patrons',
          method: 'GET',
          params: {
            deleted: true,
            deletedDate,
          },
          validateStatus: (status) => status === 200,
        },
        instance
      );
      return successResponse(entries.map((entry) => entry.id));
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          // Sierra returns a 404 rather than an empty list
          case 404:
            return successResponse([]);
        }
      }
      return unhandledError(error);
    }
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
            fields: minimumPatronFields.join(','),
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
          params: { fields: minimumPatronFields.join(',') },
          validateStatus: (status) => status === 200,
        }
      );

      const notesVarFields = verified
        ? updateVerificationNote(currentRecordResponse.data.varFields)
        : // The Sierra API's behaviour re varFields is non-intuitive:
          // we pass an array of varFields that we want to _add_. These
          // have to be x, m, or y varFields (notes, messages, images)
          // and anything else gets ignored.
          //
          // If we want to remove one, we do this by passing the
          // varField with empty content. As such, passing an empty array
          // is a no-op (there's nothing to add). This is observed
          // behaviour, which is quite vaguely documented:
          //
          // https://techdocs.iii.com/sierraapi/Content/zObjects/requestObjectDescriptions.htm#patronPUT
          [];

      await instance.put(
        '/patrons/' + recordNumber,
        {
          emails: [email],
          varFields: notesVarFields,
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
    options: NoteOptions = { type: 'Explicit' }
  ): Promise<APIResponse<PatronRecord>> {
    try {
      const instance = await this.getInstance();
      const currentRecordResponse = await instance.get<PatronResponse>(
        `/patrons/${recordNumber}`,
        {
          params: { fields: minimumPatronFields.join(',') },
          validateStatus: (status) => status === 200,
        }
      );

      const notesVarFields = updateVerificationNote(
        currentRecordResponse.data.varFields,
        options
      );

      await instance.put(
        '/patrons/' + recordNumber,
        {
          varFields: notesVarFields,
        },
        {
          validateStatus: (status) => status === 204,
        }
      );

      return successResponse(
        toPatronRecord({
          ...currentRecordResponse.data,
          varFields: [
            ...notesVarFields,
            ...currentRecordResponse.data.varFields.filter(
              ({ fieldTag }) => fieldTag !== varFieldTags.notes
            ),
          ],
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
    () => ({
      baseURL: `${this.apiRoot}/v6`,
      timeout: 10 * 1000, // 10 seconds
    })
  );
}
