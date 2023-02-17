import { verifiedEmail } from './email-verification-notes';
import {
  getPatronName,
  getVarFieldContent,
  VarField,
  varFieldTags,
} from './marc';

export function toPatronRecord(response: PatronResponse): PatronRecord {
  const patronName = getPatronName(response.varFields);
  const patronEmail =
    getVarFieldContent(response.varFields, varFieldTags.email)[0] || '';
  return {
    ...patronName,
    recordNumber: response.id,
    barcode:
      getVarFieldContent(response.varFields, varFieldTags.barcode)[0] || '',
    role: patronTypeToRole(response.patronType),
    email: patronEmail,
    verifiedEmail: verifiedEmail(response.varFields),
    createdDate: new Date(response.createdDate),
  };
}

export type Role = 'Reader' | 'Staff' | 'SelfRegistered' | 'Excluded';

// You can find an up-to-date list of patronType codes and descriptions
// in the Sierra API at: /v5/patrons/metadata
const patronTypeToRole = (patronType: number): Role => {
  switch (patronType) {
    case 7: // Reader
    case 5: // Student (Loan)
    case 10: // Students (EPQ, 16-18)
      return 'Reader';
    case 0: // Wellcome Trust Staff
    case 1: // WT Contract Staff
    case 8: // Wellcome Collection Staff
    case 15: // Inter Lib Loans
    case 16: // Photography
    case 17: // The Hub
    case 19: // Exhibitions & Events
    case 22: // Conservation
      return 'Staff';
    case 29: // Self Registered
      return 'SelfRegistered';
    case 6: // Excluded
      return 'Excluded';
    default:
      throw new Error(`Unexpected patronType: ${patronType}`);
  }
};

export type PatronRecord = {
  recordNumber: number;
  barcode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  verifiedEmail?: string;
  createdDate: Date;
};

export type PatronCreateResponse = {
  recordNumber: number;
};

export type PatronResponse = {
  id: number;
  patronType: number;
  deleted: boolean;
  varFields: VarField[];
  createdDate: string;
};

// This represents the data required to create a Patron record in Sierra. The 'fixedFields' a bit odd, as the keys of
// the embedded objects appear to be array indices of some description, but 'fixedFields' itself isn't an array...?
export type PatronCreate = {
  pin: string;
  pMessage: string;
  homeLibraryCode: string;
  patronType: number;
  fixedFields: {
    46: {
      label: string;
      value: string;
    };
  };
  varFields: {
    fieldTag: string;
    marcTag: string;
    subfields: {
      tag: string;
      content: string;
    }[];
  }[];
};

export type UpdateOptions = {
  pin?: string;
  barcodes?: [barcode: string];
  varFields?: VarField[];
};
