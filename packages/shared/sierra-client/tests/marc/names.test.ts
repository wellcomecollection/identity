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
});
