export function toPatronRecord(patronResponse: any): PatronRecord {
  const patronName = getPatronName(patronResponse.varFields);
  return {
    ...patronName,
    recordNumber: patronResponse.id,
    barcode: getVarFieldContent(patronResponse.varFields, 'b'),
    email: getVarFieldContent(patronResponse.varFields, 'z'),
    role: patronTypeToRole(patronResponse.patronType),
  };
}

function getVarFieldContent(varFields: VarField[], fieldTag: string): string {
  const found = varFields.find((varField) => varField.fieldTag === fieldTag);
  return found ? found.content || '' : '';
}

// Sierra stores the names of Patron records in two formats: MARC and non-MARC. In the former, names are represented as
// a JSON object, where each part of the name (first name, last name) is represented as a sub-object on its own. In the
// case of non-MARC, it's a single string value with various prefixes.
function getPatronName(
  varFields: VarField[]
): { firstName: string; lastName: string } {
  const found = varFields.find((varField) => varField.fieldTag === 'n');
  if (found && found.content) {
    return getPatronNameNonMarc(found.content);
  } else if (found && found.subfields) {
    return getPatronNameMarc(found.subfields);
  } else {
    return {
      firstName: '',
      lastName: '',
    };
  }
}

function getPatronNameMarc(
  subFields: SubField[]
): { firstName: string; lastName: string } {
  const firstName = subFields.find((subField) => subField.tag === 'b');
  const lastName = subFields.find((subField) => subField.tag === 'a');

  // When Sierra stores values, it stores them in a way that means they
  // can be displayed by concatenating the raw values -- including all
  // the necessary punctuation.  For example, a name record might be:
  //
  //      |cMr a|Wellcome, b|Henry
  //
  // You can remove the subfield markers (|c |a |b) to get the display string:
  //
  //      Mr Wellcome, Henry
  //
  // but when we extract the individual MARC values we get three subfields:
  //
  //      c => "Mr"           // title
  //      a => "Wellcome,"    // last name
  //      b => "Henry"        // first name
  //
  // Notice the trailing comma in the last name.  We don't want to copy
  // that bit of display punctuation into Auth0, so remove it here.
  //
  // Note: I've only ever seen the trailing punctuation on the last name,
  // and stripping it from the first name is just to be defensive.
  //
  return {
    firstName: firstName ? firstName.content.trim().replace(/(,*)$/, '') : '',
    lastName: lastName ? lastName.content.trim().replace(/(,*)$/, '') : '',
  };
}

function getPatronNameNonMarc(
  content: string
): { firstName: string; lastName: string } {
  if (!content.trim()) {
    return {
      firstName: '',
      lastName: '',
    };
  }

  content = content.replace('100', '').replace('a|', '').replace('_', '');

  let lastName = '';
  if (content.includes(',')) {
    lastName = content.substring(0, content.indexOf(','));
  }

  let firstName = '';
  if (content.includes('|b')) {
    firstName = content.substring(content.indexOf('|b') + 2, content.length);
  } else {
    firstName = content.substring(content.indexOf(',') + 1, content.length);
  }

  return {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
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
    case 8: // Wellcome Collection Staff
    case 1: // WT Contract Staff
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

type VarField = {
  fieldTag: string;
  content?: string;
  subfields?: SubField[];
};

type SubField = {
  tag: string;
  content: string;
};
