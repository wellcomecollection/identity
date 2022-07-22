import { getPatronName } from '../../src/marc';

describe('getPatronName', () => {
  it('returns an empty name if there are no matching varfields', () => {
    const name = getPatronName([]);

    expect(name.firstName).toBe('');
    expect(name.lastName).toBe('');
  });
});
