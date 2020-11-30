export default function toPatronRecord(data: any): PatronRecord {
  const patronName = getPatronName(data.varFields);
  return Object.assign(patronName, {
      recordNumber: data.id,
      barcode: getVarFieldContent(data.varFields, 'b'),
      emailAddress: getVarFieldContent(data.varFields, 'z')
    }
  );
}

function getVarFieldContent(varFields: VarField[], fieldTag: string) {
  const found = varFields.find(varField => varField.fieldTag === fieldTag);
  return found ? found.content : '';
}

function getPatronName(varFields: VarField[]) {
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

function getPatronNameMarc(subFields: VarSubField[]): PatronName {
  const title = subFields.find(subField => subField.tag === 'c')
  const firstName = subFields.find(subField => subField.tag === 'b')
  const lastName = subFields.find(subField => subField.tag === 'a')
  return {
    title: title ? title.content.trim() : '',
    firstName: firstName ? firstName.content.trim() : '',
    lastName: lastName ? lastName.content.trim() : ''
  }
}

function getPatronNameNonMarc(content: string): PatronName {
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

interface VarField {
  fieldTag: string,
  content: string,
  subfields: VarSubField[]
}

interface VarSubField {
  tag: string,
  content: string
}

interface PatronName {
  title: string;
  firstName: string;
  lastName: string;
}

export interface PatronRecord extends PatronName {
  recordNumber: number;
  barcode: string;
  emailAddress: string;
}
