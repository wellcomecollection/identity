import { getVarFieldContent } from './marc';
import { VarField, varFieldTags } from './marc';

const auth0NotePrefix = 'Auth0:';

// See https://stackoverflow.com/a/9204568
// Matches string@string.string
// There are some email addresses in Sierra that don't match this - because of whitespace,
// nonsense values, NONE values, etc. We're OK with not matching them because we need to be
// able to look them up and deal with them as email addresses, regardless.
const emailRegex = '\\S+@\\S+\\.\\S+';

// See https://stackoverflow.com/a/3143231
// Matches ISO 8601 dates like YYYY-MM-DDTHH:MM:SS.SSSSZ
const isoDateRegex =
  '\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+(?:[+-][0-2]\\d:[0-5]\\d|Z)';

// The distinction here is that we assume that users who exist already in Sierra
// are explicitlyVerified, because they must've used their registered email address to set a password.
// We distinguish between them in the message to maximise readability and to ease debugging.
const messages = {
  explicitlyVerified: 'verified by the user clicking a verification email at',
  implicitlyVerified:
    'implicitly verified on initial Auth0 login with an existing Sierra account at',
};

const messageRegex = Object.values(messages).join('|');

// This matches a note where:
// - it begins with the prefix (Auth0:)
// - the prefix is followed by an email address (captured in group `email`)
// - that is followed either by one of the messages or at the very least, a string containing "verified"
// - it optionally ends with an ISO 8601 datetime string (captured in group `date`)
//
// For example, it would match:
// `Auth0: example@example.com verified by the user clicking a verification email at 2022-02-22T00:00:00.000Z`
// `Auth0: example@example.com verified by the user clicking a verification email at`
// `Auth0: example@example.com foo bar verified beep boop`
//
// The intention of this is that a note that has been accidentally modified is still parseable if the bare
// minimum of information is present
const emailNoteRegex = new RegExp(
  `^${auth0NotePrefix}\\s+(?<email>${emailRegex})\\s*(?:${messageRegex}|(.*verified.*))?\\s*(?<date>${isoDateRegex})?\$`
);

type VerificationNote = {
  email: string;
  date?: Date;
};

export type NoteOptions = {
  type: 'Implicit' | 'Explicit';
};

const parseVerificationNote = (note: string): VerificationNote | undefined => {
  const match = note.match(emailNoteRegex);
  if (!match || !match.groups) {
    return undefined;
  }

  const { email, date: dateString } = match.groups;
  const maybeDate = new Date(dateString);
  if (!email) {
    return undefined;
  }

  return { email, date: isNaN(maybeDate.getDate()) ? undefined : maybeDate };
};

const createVerificationNote = (
  { email, date = new Date() }: VerificationNote,
  { type }: NoteOptions
): string =>
  [
    auth0NotePrefix,
    email,
    type === 'Implicit'
      ? messages.implicitlyVerified
      : messages.explicitlyVerified,
    date.toISOString(),
  ].join(' ');

const removeVerificationNotes = (notes: string[]): string[] =>
  notes.filter((note) => {
    const parsedNote = parseVerificationNote(note);
    return !parsedNote;
  });

const upsertVerificationNote = (
  note: VerificationNote,
  opts: NoteOptions,
  notes: string[]
): string[] => [
  ...removeVerificationNotes(notes),
  createVerificationNote(note, opts),
];

export const verifiedEmail = (varFields: VarField[]): string | undefined =>
  getVarFieldContent(varFields, varFieldTags.notes)
    .map(parseVerificationNote)
    .find((verified): verified is VerificationNote =>
      Boolean(
        verified && (!verified.date || verified.date.getTime() <= Date.now())
      )
    )?.email;

export const updateVerificationNote = (
  varFields: VarField[],
  opts: NoteOptions = { type: 'Explicit' }
): VarField[] => {
  const currentNotes = getVarFieldContent(varFields, varFieldTags.notes);
  const email = getVarFieldContent(varFields, varFieldTags.email)[0] || '';
  const updatedNotes = upsertVerificationNote(
    {
      email,
      date: new Date(),
    },
    opts,
    currentNotes
  );

  return updatedNotes.map((note) => ({
    fieldTag: varFieldTags.notes,
    content: note,
  }));
};
