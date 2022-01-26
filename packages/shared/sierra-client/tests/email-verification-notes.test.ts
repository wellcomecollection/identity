import {
  addVerificationNote,
  deleteOldVerificationNotes,
  verifiedEmails,
} from '../src/email-verification-notes';
import { VarField, varFieldTags } from '../src/patron';

const notesToVarFields = (...notes: string[]): VarField[] =>
  notes.map((content) => ({
    fieldTag: varFieldTags.notes,
    content,
  }));

describe('email verification notes', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2022-02-22'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('addVerificationNote', () => {
    it('adds a verification note varfield while leaving others alone', () => {
      const result = addVerificationNote([
        {
          fieldTag: varFieldTags.email,
          content: 'example@example.com',
        },
        {
          fieldTag: varFieldTags.barcode,
          content: '1234567',
        },
      ]);

      expect(result).toHaveLength(3);
      expect(
        result.find(({ fieldTag }) => fieldTag === varFieldTags.notes)?.content
      ).toBe('Auth0: example@example.com verified at 2022-02-22T00:00:00.000Z');
    });

    it('modifies the message to show that verification was assumed, not explicit', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2022-02-22'));
      const result = addVerificationNote(
        [
          {
            fieldTag: varFieldTags.email,
            content: 'example@example.com',
          },
        ],
        true
      );

      expect(result).toHaveLength(2);
      expect(result[1].content).toBe(
        'Auth0: example@example.com assumed to be verified at login 2022-02-22T00:00:00.000Z'
      );
    });
  });

  describe('deleteOldVerificationNotes', () => {
    it('deletes notes containing an email other than the current user email and ignores all others', () => {
      const result = deleteOldVerificationNotes([
        {
          fieldTag: varFieldTags.email,
          content: 'new@email.com',
        },
        ...notesToVarFields(
          'Auth0: email@example.com assumed to be verified at login 2022-02-22T00:00:00.000Z', // This is the only note that should be deleted
          'Auth0: new@email.com verified at 2022-02-22T00:00:00.000Z',
          'Auth1: email@example.com assumed to be verified at login 2022-02-22T00:00:00.000Z',
          'Auth0: email@example.com arble garble blarble 2022-02-22T00:00:00.000Z',
          'Auth0: email@example.com verified about a week ago, I think',
          'Auth0: invalid@email verified 2022-02-22T00:00:00.000Z',
          'Werewolf, barred from the library on full moons'
        ),
      ]);

      expect(result).toHaveLength(7);
      expect(result.map((field) => field.content)).not.toContain(
        'Auth0: email@example.com assumed to be verified at login 2022-02-22T00:00:00.000Z'
      );
    });
  });

  describe('verifiedEmails', () => {
    const noteField = (note: string) => ({
      fieldTag: varFieldTags.notes,
      content: note,
    });

    it('returns the verified emails for all variants of verification notes', () => {
      expect(
        verifiedEmails([
          noteField(
            'Auth0: example@example.com verified at 2022-02-21T00:00:00.000Z'
          ),
          noteField(
            'Auth0: example2@example.com assumed to be verified at login 2022-02-21T00:00:00.000Z'
          ),
        ])
      ).toEqual(['example@example.com', 'example2@example.com']);
    });

    it('ignores notes where the date is in the future', () => {
      expect(
        verifiedEmails([
          noteField(
            'Auth0: example@example.com verified at 2022-02-23T00:00:00.000Z'
          ),
        ])
      ).toEqual([]);
    });

    it('ignores other notes and fields', () => {
      expect(
        verifiedEmails([
          noteField('another@email.com'),
          {
            fieldTag: varFieldTags.barcode,
            content: '1234567',
          },
        ])
      ).toEqual([]);
    });
  });
});
