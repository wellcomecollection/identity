import { PatronResponse, toPatronRecord } from '../src/patron';

describe('toPatronRecord', () => {
  it('creates a patron name from MARC subfields', () => {
    const recordMarc: any = {
      id: 123456,
      patronType: 7,
      varFields: [
        {
          fieldTag: 'b',
          content: '1234567',
        },
        {
          fieldTag: 'z',
          content: 'h.wellcome@wellcome.org',
        },
        {
          fieldTag: 'n',
          marcTag: '100',
          ind1: ' ',
          ind2: ' ',
          subfields: [
            {
              tag: 'a',
              content: 'Wellcome',
            },
            {
              tag: 'b',
              content: 'Henry',
            },
          ],
        },
      ],
    };

    const result = toPatronRecord(recordMarc);

    expect(result.firstName).toEqual('Henry');
    expect(result.lastName).toEqual('Wellcome');
  });

  it('gets the createdDate of the user', () => {
    const recordMarc: PatronResponse = {
      id: 123456,
      patronType: 7,
      deleted: false,
      varFields: [
        {
          fieldTag: 'b',
          content: '1234567',
        },
        {
          fieldTag: 'z',
          content: 'h.wellcome@wellcome.org',
        },
        {
          fieldTag: 'n',
          marcTag: '100',
          ind1: ' ',
          ind2: ' ',
          subfields: [
            {
              tag: 'a',
              content: 'Wellcome',
            },
            {
              tag: 'b',
              content: 'Henry',
            },
          ],
        },
      ],
      createdDate: '2022-06-21T15:37:32Z',
    };

    const result = toPatronRecord(recordMarc);

    expect(result.createdDate).toEqual(new Date('2022-06-21T15:37:32Z'));
  });

  it('strips the trailing comma from names', () => {
    const recordMarc: PatronResponse = {
      id: 1101796,
      patronType: 7,
      deleted: false,
      varFields: [
        {
          fieldTag: 'b',
          content: '1101796',
        },
        {
          fieldTag: 'm',
          content:
            'This record is needed for automated tests in the requesting service on wellcomecollection.org. Tests will fail if this record is deleted. Please do not delete this record.',
        },
        {
          fieldTag: 'z',
          content: 'digital@wellcomecollection.org',
        },
        {
          fieldTag: 'n',
          marcTag: '100',
          ind1: ' ',
          ind2: ' ',
          subfields: [
            {
              tag: 'a',
              content: 'TEST,',
            },
            {
              tag: 'b',
              content: 'Requesting',
            },
          ],
        },
      ],
      createdDate: '2022-06-21T15:37:32Z',
    };

    const result = toPatronRecord(recordMarc);

    expect(result.firstName).toEqual('Requesting');
    expect(result.lastName).toEqual('TEST');
  });

  const createRecordWithPatronType = (patronType: number): PatronResponse => ({
    id: 123456,
    patronType,
    deleted: false,
    varFields: [
      {
        fieldTag: 'b',
        content: '1234567',
      },
      {
        fieldTag: 'z',
        content: 'h.wellcome@wellcome.org',
      },
      {
        fieldTag: 'n',
        marcTag: '100',
        ind1: ' ',
        ind2: ' ',
        subfields: [
          {
            tag: 'a',
            content: 'Wellcome',
          },
          {
            tag: 'b',
            content: 'Henry',
          },
        ],
      },
    ],
    createdDate: '2022-06-21T15:37:32Z',
  });

  test.each([
    { patronType: 7, role: 'Reader' },
    { patronType: 8, role: 'Staff' },
    { patronType: 9, role: 'StaffWithRestricted' },
    { patronType: 29, role: 'SelfRegistered' },
    { patronType: 6, role: 'Excluded' },
  ])('maps patronType $patronType to role $role', ({ patronType, role }) => {
    const record = createRecordWithPatronType(patronType);
    expect(toPatronRecord(record).role).toBe(role);
  });

  it('throws an error for unexpected patron types', () => {
    const record = createRecordWithPatronType(1000); // Higher than all known patron types
    expect(() => toPatronRecord(record)).toThrow();
  });
});
