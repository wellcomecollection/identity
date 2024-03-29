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
  PatronCreateResponse,
  PatronRecord,
  PatronResponse,
  toPatronRecord,
  UpdateOptions,
} from './patron';
import { varFieldTags } from './marc/fields';
import SierraClient from './SierraClient';
import {
  NoteOptions,
  updateVerificationNote,
} from './email-verification-notes';
import { paginatedSierraResults } from './pagination';
import { createNameVarField } from './marc';

const minimumPatronFields = ['varFields', 'patronType', 'createdDate'];

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
    email: string,
    password: string
  ): Promise<APIResponse<PatronCreateResponse>> {
    return this.getInstance().then(async (instance) => {
      try {
        // Messages: we want to be able to add notes to new patrons who registered via the new sign-up process through auth0
        const registrationNotePrefix = 'Auth0_Registration:';
        const messages = {
          // This is for debugging; it helps us know where users were created (through Auth0,
          // the old process, directly in Sierra, etc).
          registrationDetails:
            'this user was created using membership sign-up via Auth0 on wellcomecollection.org',
        };
        const messagesCombined = Object.values(messages).join('|');

        // Create the patron in marc format
        // Rationale: After a short discussion with Natalie on what we ideally want from a newly created patron
        // the new patron format should be MARC - if we create in non-MARC, it will means someone
        // in the library will eventually have to edit the patron record to make it MARC
        // creating the patron in MARC format means less work for library staff
        const response = await instance.post(
          '/patrons/',
          {
            patronType: 29,
            pin: password,
            fixedFields: {
              // This matches the previous sign-up process, which sets the user category
              // to 13 ("Other").  If you don't set it, then it defaults to 0 ("University staff").
              46: {
                label: 'USER CAT.',
                value: '13',
              },
              // We use this to show if someone first:
              //
              //  - registered in person ('home ')
              //  - registered online ('sreg ')
              //
              53: {
                label: 'HOME LIBR',
                value: 'sreg ',
              },
              // Opens the message SELF REG when staff open a patron record. This is so they can see
              // it's a self reg record and the person has not been in to the library to give us their address and IDs.
              54: {
                label: 'PMESSAGE',
                value: 's',
              },
              // Here 'z' = 'email'
              268: { label: 'Notice Preference', value: 'z' },
            },
            varFields: [
              createNameVarField({ firstName, lastName }),
              {
                fieldTag: 'z',
                content: email.toLocaleLowerCase(),
              },
              {
                fieldTag: 'x',
                content: `${registrationNotePrefix} ${messagesCombined}`,
              },
            ],
          },
          { validateStatus: (status: number) => status === 200 }
        );
        // A successful patron creation POST results in a url link to patron
        const link = response.data.link;
        const patronLinkRegex = /\/patrons\/(?<patronId>\d+)$/;
        const match = link.match(patronLinkRegex);
        if (match) {
          return successResponse({
            recordNumber: Number(match.groups.patronId),
          });
        } else {
          return errorResponse(
            `Patron creation response was malformed: ${link}`,
            ResponseStatus.UnknownError
          );
        }
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

              // The /find endpoint is meant to return a single user, but if Sierra
              // finds multiple users it returns an error:
              //
              //    {
              //      "code": 133,
              //      "specificCode": 0,
              //      "httpStatus": 409,
              //      "name": "Internal server error",
              //      "description": "Duplicate patrons found for the specified varFieldTag[z]."
              //    }
              //
              case 409:
                if (
                  error.response.data.description ===
                  'Duplicate patrons found for the specified varFieldTag[z].'
                ) {
                  return errorResponse(
                    `There are duplicate patron records with email address [${email}]`,
                    ResponseStatus.DuplicateUsers,
                    error
                  );
                }
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

  async updatePatron(
    recordNumber: number,
    options: UpdateOptions
  ): Promise<APIResponse<PatronRecord>> {
    return this.getInstance().then((instance) => {
      return instance
        .put('/patrons/' + recordNumber, options, {
          validateStatus: (status) => status === 204,
        })
        .then(() => this.getPatronRecordByRecordNumber(recordNumber))
        .catch((error) => {
          switch (error.response.status) {
            case 404:
              return errorResponse(
                'Patron record with recordNumber [' +
                  recordNumber +
                  '] not found',
                ResponseStatus.NotFound,
                error
              );
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
