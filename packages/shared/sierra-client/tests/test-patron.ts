export const recordNumber: number = 123456;
export const barcode: string = '654321';
export const pin: string = 'superstrongpassword';
export const firstName: string = 'Test';
export const lastName: string = 'User';
export const email: string = 'test.user@example.com';

export const recordMarc: any = {
  id: 123456,
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
};

export const recordNonMarc: any = {
  id: 123456,
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
      content: 'a|' + lastName + ', |b' + firstName,
    },
  ],
};
