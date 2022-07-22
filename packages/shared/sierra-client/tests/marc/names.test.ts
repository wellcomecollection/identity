import { getPatronName, varFieldTags } from '../../src/marc';

describe('getPatronName', () => {
  it('returns an empty name if there are no matching varfields', () => {
    const name = getPatronName([]);

    expect(name.firstName).toBe('');
    expect(name.lastName).toBe('');
  });

  it('returns an empty name if the contents of field tag n is empty', () => {
    const name = getPatronName([
      {
        fieldTag: varFieldTags.name,
        content: ' ',
      },
    ]);

    expect(name.firstName).toBe('');
    expect(name.lastName).toBe('');
  });

  describe('extracting MARC-style names from the subfields', () => {
    it('skips title in subfield $c; removes trailing punctuation in $a', () => {
      const name = getPatronName([
        {
          fieldTag: 'n',
          ind1: ' ',
          ind2: ' ',
          marcTag: '100',
          subfields: [
            { content: 'Blackwell,', tag: 'a' },
            { content: 'Dr', tag: 'c' },
            { content: 'Elizabeth', tag: 'b' },
          ],
        },
      ]);

      expect(name.firstName).toBe('Elizabeth');
      expect(name.lastName).toBe('Blackwell');
    });

    it('leaves underscores as-is', () => {
      const name = getPatronName([
        {
          fieldTag: 'n',
          ind1: ' ',
          ind2: ' ',
          marcTag: '100',
          subfields: [
            { content: 'Hodgson,', tag: 'a' },
            { content: 'Jane_Elizabeth', tag: 'b' },
          ],
        },
      ]);

      expect(name.firstName).toBe('Jane_Elizabeth');
      expect(name.lastName).toBe('Hodgson');
    });
  });

  describe('extracting names from the contents', () => {
    it('extracts a human-readable name from the contents', () => {
      const name = getPatronName([
        {
          fieldTag: varFieldTags.name,
          content: 'Ganguly, Kadambini',
        },
      ]);

      expect(name.firstName).toBe('Kadambini');
      expect(name.lastName).toBe('Ganguly');
    });

    it('extracts a MARC-style name from the contents', () => {
      const name = getPatronName([
        {
          fieldTag: varFieldTags.name,
          content: 'Jemison, |cDr|bMae',
        },
      ]);

      expect(name.firstName).toBe('Mae');
      expect(name.lastName).toBe('Jemison');
    });

    it('ignores underscores in the content', () => {
      const name = getPatronName([
        {
          fieldTag: varFieldTags.name,
          content: 'Crumpler, |bRebecca_Lee',
        },
      ]);

      expect(name.firstName).toBe('Rebecca_Lee');
      expect(name.lastName).toBe('Crumpler');
    });

    it('puts everything in the first name if there’s no punctuation', () => {
      const name = getPatronName([
        {
          fieldTag: varFieldTags.name,
          content: 'Virginia Apgar',
        },
      ]);

      expect(name.firstName).toBe('Virginia Apgar');
      expect(name.lastName).toBe('');
    });
  });
});
