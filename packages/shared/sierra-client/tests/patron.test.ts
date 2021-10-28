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
            {tag: 'a', content: 'Wellcome'},
            {tag: 'b', content: 'Henry'},
          ],
        },
      ],
    };

    const result = toPatronRecord(recordMarc);

    expect(result.firstName).toEqual('Henry');
    expect(result.lastName).toEqual('Wellcome');
  });
});
