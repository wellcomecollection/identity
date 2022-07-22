import { PatronResponse } from './patron';

export const recordNumber: number = 123456;
export const barcode: string = '654321';
export const pin: string = 'superstrongpassword';
export const firstName: string = 'Test';
export const lastName: string = 'User';
export const email: string = 'test.user@example.com';
export const role: string = 'Reader';
export const verifiedEmail: string | undefined = undefined;
export const createdDate: string = '2001-01-01T01:01:01Z';

export const recordMarc: PatronResponse = {
  id: 123456,
  deleted: false,
  patronType: 7,
  varFields: [
    {
      fieldTag: 'b',
      content: barcode,
    },
    {
      fieldTag: 'z',
      content: email,
    },
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
  ],
  createdDate,
};

export const recordNonMarc: PatronResponse = {
  id: 123456,
  patronType: 7,
  deleted: false,
  varFields: [
    {
      fieldTag: 'b',
      content: barcode,
    },
    {
      fieldTag: 'z',
      content: email,
    },
    {
      fieldTag: 'n',
      content: `${lastName}, |b${firstName}`,
    },
  ],
  createdDate,
};
