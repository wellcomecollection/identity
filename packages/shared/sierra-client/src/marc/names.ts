import { SubField, VarField, varFieldTags } from '.';

type Name = {
  firstName: string;
  lastName: string;
};

export function createNameVarField({ firstName, lastName }: Name): VarField {
  return {
    fieldTag: varFieldTags.name,
    marcTag: '100',
    subfields: [
      // The trailing comma allows the MARC values to be concatenated into one string:
      //
      //         Smith, |cDr |bJane
      //      => Smith, Dr Jane
      //
      // This also mirrors patron records that were created in the previous system.
      {
        tag: 'a',
        content: `${lastName},`,
      },
      {
        tag: 'b',
        content: firstName,
      },
    ],
  };
}

// Sierra stores the names of Patron records in two formats: MARC and non-MARC. In the former, names are represented as
// a JSON object, where each part of the name (first name, last name) is represented as a sub-object on its own. In the
// case of non-MARC, it's a single string value with various prefixes.
export function getPatronName(varFields: VarField[]): Name {
  const found = varFields.find(
    (varField) => varField.fieldTag === varFieldTags.name
  );
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

function getPatronNameMarc(subFields: SubField[]): Name {
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

function getPatronNameNonMarc(content: string): Name {
  if (!content.trim()) {
    return {
      firstName: '',
      lastName: '',
    };
  }

  const lastName = content.includes(',')
    ? content.substring(0, content.indexOf(','))
    : '';

  const firstName = content.includes('|b')
    ? content.substring(content.indexOf('|b') + 2)
    : content.substring(content.indexOf(',') + 1);

  return {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
  };
}
