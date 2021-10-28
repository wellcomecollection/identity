import { toPatronRecord } from '../src/patron';

describe('toPatronRecord', () => {
  it('creates a patron name from MARC subfields', () => {
    const recordMarc: any = {
      id: 123456,
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

  it('strips the trailing comma from names', () => {
    const recordMarc: any = {
      id: 1101796,
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
    };

    const result = toPatronRecord(recordMarc);

    expect(result.firstName).toEqual('Requesting');
    expect(result.lastName).toEqual('TEST');
  });
});
