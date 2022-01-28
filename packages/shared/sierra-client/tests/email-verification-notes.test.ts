import {
  updateVerificationNote,
  deleteNonCurrentVerificationNotes,
  verifiedEmail,
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

  describe('updateVerificationNote', () => {
    it('updates a verification note varfield while leaving others alone', () => {
      const varFields = [
        {
          fieldTag: varFieldTags.notes,
          content:
            'Auth0: old@email.com verified by the user clicking a verification email at 2021-01-11T00:00:00.000Z',
        },
        {
          fieldTag: varFieldTags.notes,
          content: 'Something else',
        },
        {
          fieldTag: varFieldTags.email,
          content: 'example@example.com',
        },
        {
          fieldTag: varFieldTags.barcode,
          content: '1234567',
        },
      ];
      const result = updateVerificationNote(varFields);

      expect(result).toHaveLength(4);
      const notes = result
        .filter(({ fieldTag }) => fieldTag === varFieldTags.notes)
        .map(({ content }) => content);
      expect(notes).toContain(
        'Auth0: example@example.com verified by the user clicking a verification email at 2022-02-22T00:00:00.000Z'
      );
      expect(notes).toContain('Something else');
      expect(result).toContainEqual(varFields[2]);
      expect(result).toContainEqual(varFields[3]);
    });

    it('adds a new a verification note varfield if one does not exist already', () => {
      const result = updateVerificationNote([
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
      ).toBe(
        'Auth0: example@example.com verified by the user clicking a verification email at 2022-02-22T00:00:00.000Z'
      );
    });

    it('modifies the message to show that verification was assumed, not explicit', () => {
      const result = updateVerificationNote(
        [
          {
            fieldTag: varFieldTags.email,
            content: 'example@example.com',
          },
        ],
        { type: 'Implicit' }
      );

      expect(result).toHaveLength(2);
      expect(result[1].content).toBe(
        'Auth0: example@example.com implicitly verified on initial Auth0 login with an existing Sierra account at 2022-02-22T00:00:00.000Z'
      );
    });
  });

  describe('deleteNonCurrentVerificationNotes', () => {
    it('deletes notes containing an email other than the current user email and ignores all others', () => {
      const result = deleteNonCurrentVerificationNotes([
        {
          fieldTag: varFieldTags.email,
          content: 'new@email.com',
        },
        ...notesToVarFields(
          'Auth0: email@example.com implicitly verified on initial Auth0 login with an existing Sierra account at 2022-02-22T00:00:00.000Z', // This is the only note that should be deleted
          'Auth0: new@email.com verified by the user clicking a verification email at 2022-02-22T00:00:00.000Z',
          'Auth1: email@example.com implicitly verified on initial Auth0 login with an existing Sierra account at 2022-02-22T00:00:00.000Z',
          'Auth0: email@example.com arble garble blarble 2022-02-22T00:00:00.000Z',
          'Auth0: email@example.com verified by the user clicking a verification email at about a week ago, I think',
          'Auth0: invalid@email verified by the user clicking a verification email at 2022-02-22T00:00:00.000Z',
          'Werewolf, barred from the library on full moons'
        ),
      ]);

      expect(result).toHaveLength(7);
      expect(result.map((field) => field.content)).not.toContain(
        'Auth0: email@example.com implicitly verified on initial Auth0 login with an existing Sierra account at 2022-02-22T00:00:00.000Z'
      );
    });
  });

  describe('verifiedEmail', () => {
    const noteField = (note: string) => ({
      fieldTag: varFieldTags.notes,
      content: note,
    });

    it('returns the verified email for all variants of verification notes', () => {
      expect([
        verifiedEmail([
          noteField(
            'Auth0: example@example.com verified by the user clicking a verification email at 2022-02-21T00:00:00.000Z'
          ),
        ]),
        verifiedEmail([
          noteField(
            'Auth0: example2@example.com implicitly verified on initial Auth0 login with an existing Sierra account at 2022-02-21T00:00:00.000Z'
          ),
        ]),
      ]).toEqual(['example@example.com', 'example2@example.com']);
    });

    it('ignores notes where the date is in the future', () => {
      expect(
        verifiedEmail([
          noteField(
            'Auth0: example@example.com verified by the user clicking a verification email at 2022-02-23T00:00:00.000Z'
          ),
        ])
      ).toEqual(undefined);
    });

    it('ignores other notes and fields', () => {
      expect(
        verifiedEmail([
          noteField('another@email.com'),
          {
            fieldTag: varFieldTags.barcode,
            content: '1234567',
          },
        ])
      ).toEqual(undefined);
    });
  });
});
