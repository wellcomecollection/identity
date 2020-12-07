export function toPatronRecord(data: any): PatronRecord {
  const patronName = getPatronName(data.varFields);
  return Object.assign(patronName, {
    recordNumber: data.id,
    barcode: getVarFieldContent(data.varFields, 'b'),
    email: getVarFieldContent(data.varFields, 'z')
  });
}

function getVarFieldContent(varFields: VarField[], fieldTag: string): string {
  const found = varFields.find(varField => varField.fieldTag === fieldTag);
  return found ? found.content || '' : '';
}

function getPatronName(varFields: VarField[]): { title: string, firstName: string, lastName: string } {
  const found = varFields.find(varField => varField.fieldTag === 'n');
  if (found && found.content) {
    return getPatronNameNonMarc(found.content);
  } else if (found && found.subfields) {
    return getPatronNameMarc(found.subfields);
  } else {
    return {
      title: '',
      firstName: '',
      lastName: ''
    }
  }
}

function getPatronNameMarc(subFields: SubField[]): { title: string, firstName: string, lastName: string } {
  const title = subFields.find(subField => subField.tag === 'c')
  const firstName = subFields.find(subField => subField.tag === 'b')
  const lastName = subFields.find(subField => subField.tag === 'a')
  return {
    title: title ? title.content.trim() : '',
    firstName: firstName ? firstName.content.trim() : '',
    lastName: lastName ? lastName.content.trim() : ''
  }
}

function getPatronNameNonMarc(content: string): { title: string, firstName: string, lastName: string } {
  if (!content.trim()) {
    return {
      title: '',
      firstName: '',
      lastName: ''
    };
  }

  content = content.replace('100', '').replace('a|', '').replace('_', '');

  let lastName = '';
  if (content.includes(',')) {
    lastName = content.substring(0, content.indexOf(','));
  }

  let title = '';
  if (content.includes('|c')) {
    title = content.substring(content.indexOf('|c') + 2, content.indexOf('|b'));
  }

  let firstName = '';
  if (content.includes('|b')) {
    firstName = content.substring(content.indexOf('|b') + 2, content.length);
  } else {
    firstName = content.substring(content.indexOf(',') + 1, content.length);
  }

  return {
    title: title.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim()
  };
}

export function toCreatePatron(title: string, firstName: string, lastName: string, email: string, pin: string): PatronCreate {
  return {
    emails: [email],
    names: [lastName + ',' + ' ' + title + ' ' + firstName],
    pin: pin,
    pMessage: 's',
    homeLibraryCode: 'sreg',
    patronType: BigInt(29),
    fixedFields: {
      46: {
        label: "USER CAT.",
        value: "13"
      },
    }
  }
}

export function extractRecordNumberFromCreate(link: string): bigint {
  const match = link.match(/^https:\/\/.+?\/v6\/patrons\/(\d+)$/);
  if (!match || match.length < 2) {
    throw new Error('Patron creation link [' + link + '] not in expected format');
  }
  return BigInt(match[1]);
}

export interface PatronRecord {
  recordNumber: bigint;
  barcode: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PatronCreate {
  emails: string[],
  names: string[],
  pin: string,
  pMessage: string,
  homeLibraryCode: string,
  patronType: bigint,
  fixedFields: {
    46: {
      label: string,
      value: string
    }
  }
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
