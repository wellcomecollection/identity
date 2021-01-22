export function toPatronRecord(patronRecord: any): PatronRecord {
  const patronName = getPatronName(patronRecord.varFields);
  return Object.assign(patronName, {
    recordNumber: patronRecord.id,
    barcode: getVarFieldContent(patronRecord.varFields, 'b'),
    email: getVarFieldContent(patronRecord.varFields, 'z')
  });
}

function getVarFieldContent(varFields: VarField[], fieldTag: string): string {
  const found = varFields.find(varField => varField.fieldTag === fieldTag);
  return found ? found.content || '' : '';
}

// Sierra stores the names of Patron records in two formats: MARC and non-MARC. In the former, names are represented as
// a JSON object, where each part of the name (first name, last name) is represented as a sub-object on its own. In the
// case of non-MARC, it's a single string value with various prefixes.
function getPatronName(varFields: VarField[]): { firstName: string, lastName: string } {
  const found = varFields.find(varField => varField.fieldTag === 'n');
  if (found && found.content) {
    return getPatronNameNonMarc(found.content);
  } else if (found && found.subfields) {
    return getPatronNameMarc(found.subfields);
  } else {
    return {
      firstName: '',
      lastName: ''
    }
  }
}

function getPatronNameMarc(subFields: SubField[]): { firstName: string, lastName: string } {
  const firstName = subFields.find(subField => subField.tag === 'b')
  const lastName = subFields.find(subField => subField.tag === 'a')
  return {
    firstName: firstName ? firstName.content.trim() : '',
    lastName: lastName ? lastName.content.trim() : ''
  }
}

function getPatronNameNonMarc(content: string): { firstName: string, lastName: string } {
  if (!content.trim()) {
    return {
      firstName: '',
      lastName: ''
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
    lastName: lastName.trim()
  };
}

// There's a bunch of hardcoded fields in here. This is intentional, these are static and don't change and mostly
// indicate that the user has self-registered. I don't think we need to extract them out into configuration.
export function toCreatePatron(firstName: string, lastName: string, pin: string): PatronCreate {
  return {
    pin: pin,
    pMessage: 's',
    homeLibraryCode: 'sreg',
    patronType: 29,
    fixedFields: {
      46: {
        label: 'USER CAT.',
        value: '13'
      },
    },
    varFields: [
      {
        fieldTag: 'n',
        marcTag: '100',
        subfields: [
          {
            tag: 'a',
            content: lastName
          },
          {
            tag: 'b',
            content: firstName
          }
        ]
      }
    ]
  }
}

// The Patron record creation endpoint returns in response to a successful record creation the full URL to the API
// endpoint to query that new record. We're not interested in that, just give us the Patron record number.
export function extractRecordNumberFromLink(link: string): number {
  const match = link.match(/^https:\/\/.+?\/v6\/patrons\/(\d+)$/);
  if (!match || match.length < 2) {
    throw new Error('Patron creation link [' + link + '] not in expected format');
  }
  return Number(match[1]);
}

export interface PatronRecord {
  recordNumber: number;
  barcode: string;
  firstName: string;
  lastName: string;
  email: string;
}

// This represents the data required to create a Patron record in Sierra. The 'fixedFields' a bit odd, as the keys of
// the embedded objects appear to be array indices of some description, but 'fixedFields' itself isn't an array...?
export interface PatronCreate {
  pin: string,
  pMessage: string,
  homeLibraryCode: string,
  patronType: number,
  fixedFields: {
    46: {
      label: string,
      value: string
    }
  },
  varFields: {
    fieldTag: string,
    marcTag: string,
    subfields: {
      tag: string,
      content: string
    }[]
  }[]
}

interface VarField {
  fieldTag: string,
  content?: string,
  subfields?: SubField[]
}

interface SubField {
  tag: string,
  content: string
}
