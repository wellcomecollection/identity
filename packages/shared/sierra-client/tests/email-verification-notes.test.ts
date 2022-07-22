import {
  updateVerificationNote,
  verifiedEmail,
} from '../src/email-verification-notes';
import { varFieldTags } from '../src/marc';

describe('email verification notes', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2022-02-22'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('updateVerificationNote', () => {
    it('returns a list of the notes varfields including the new verification note and any other notes', () => {
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

      expect(result).toHaveLength(2);
      const notes = result.map(({ content }) => content);
      expect(notes).toContain(
        'Auth0: example@example.com verified by the user clicking a verification email at 2022-02-22T00:00:00.000Z'
      );
      expect(notes).toContain('Something else');
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

      expect(result).toHaveLength(1);
      expect(result[0]?.content).toBe(
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

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe(
        'Auth0: example@example.com implicitly verified on initial Auth0 login with an existing Sierra account at 2022-02-22T00:00:00.000Z'
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

    it('is tolerant of partially modified/malformed notes', () => {
      expect([
        verifiedEmail([noteField('Auth0: example@example.com verified')]),
        verifiedEmail([
          noteField(
            'Auth0: example2@example.com implicitly verified Auasdfgdfgs(*^&%T(IYGUdfkjhgchgfc 2022-02-21T00:00:00.000Z'
          ),
        ]),
      ]).toEqual(['example@example.com', 'example2@example.com']);
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
