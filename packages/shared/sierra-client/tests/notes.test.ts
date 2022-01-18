import { createAuth0Note, getAuth0Note } from '../src/notes';

describe('notes field contents', () => {
  describe('parsing', () => {
    it('parses a string that adheres to our format', () => {
      const field =
        'Auth0: assumed to be verified at login 2022-02-22T00:00:00.000Z';
      const result = getAuth0Note(field);

      expect(result).toEqual(['AssumedVerified', new Date('2022-02-22')]);
    });

    it('ignores malformed strings', () => {
      const malformed1 =
        'Auth1: assumed to be verified at login 2022-02-22T00:00:00.000Z';
      const malformed2 = 'Auth0: arble garble blarble 2022-02-22T00:00:00.000Z';
      const malformed3 = 'Auth0: verified about a week ago, I think';

      expect(getAuth0Note(malformed1)).toBe(undefined);
      expect(getAuth0Note(malformed2)).toBe(undefined);
      expect(getAuth0Note(malformed3)).toBe(undefined);
    });

    it('ignores irrelevant strings', () => {
      const field = 'Werewolf, barred from the library on full moons';
      expect(getAuth0Note(field)).toBe(undefined);
    });
  });

  describe('creation', () => {
    it('creates a note field for a given state', () => {
      const date = new Date('2022-02-22');
      expect(createAuth0Note('Verified', date)).toBe(
        'Auth0: verified 2022-02-22T00:00:00.000Z'
      );
      expect(createAuth0Note('AssumedVerified', date)).toBe(
        'Auth0: assumed to be verified at login 2022-02-22T00:00:00.000Z'
      );
    });
  });
});
