import { createAuth0Note, getAuth0Note } from '../src/notes';

describe('notes field contents', () => {
  describe('parsing', () => {
    it('parses a string that adheres to our format', () => {
      const field =
        'Auth0: email@example.com assumed to be verified at login 2022-02-22T00:00:00.000Z';
      const result = getAuth0Note(field);

      expect(result).toEqual({
        type: 'EmailAssumedVerified',
        payload: 'email@example.com',
        date: new Date('2022-02-22'),
      });
    });

    it('ignores malformed strings', () => {
      const malformed1 =
        'Auth1: email@example.com assumed to be verified at login 2022-02-22T00:00:00.000Z';
      const malformed2 =
        'Auth0: email@example.com arble garble blarble 2022-02-22T00:00:00.000Z';
      const malformed3 =
        'Auth0: email@example.com verified about a week ago, I think';
      const malformed4 =
        'Auth0: invalid@email verified 2022-02-22T00:00:00.000Z';

      expect(getAuth0Note(malformed1)).toBe(undefined);
      expect(getAuth0Note(malformed2)).toBe(undefined);
      expect(getAuth0Note(malformed3)).toBe(undefined);
      expect(getAuth0Note(malformed4)).toBe(undefined);
    });

    it('ignores irrelevant strings', () => {
      const field = 'Werewolf, barred from the library on full moons';
      expect(getAuth0Note(field)).toBe(undefined);
    });
  });

  describe('creation', () => {
    it('creates a note field for a given state', () => {
      const date = new Date('2022-02-22');

      expect(
        createAuth0Note({
          type: 'EmailVerified',
          payload: 'email@example.com',
          date,
        })
      ).toBe('Auth0: email@example.com verified 2022-02-22T00:00:00.000Z');

      expect(
        createAuth0Note({
          type: 'EmailAssumedVerified',
          payload: 'email@example.com',
          date,
        })
      ).toBe(
        'Auth0: email@example.com assumed to be verified at login 2022-02-22T00:00:00.000Z'
      );
    });
  });
});
