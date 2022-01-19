const auth0NotePrefix = 'Auth0:';

// See https://stackoverflow.com/a/9204568
// Matches string@string.string
const emailRegex = '\\S+@\\S+\\.\\S+';

// See https://stackoverflow.com/a/3143231
// Matches ISO 8601 dates like YYYY-MM-DDTHH:MM:SS.SSSSZ
const isoDateRegex =
  '\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+(?:[+-][0-2]\\d:[0-5]\\d|Z)';

type NoteType = 'EmailVerified' | 'EmailAssumedVerified';
type Note = {
  type: NoteType;
  date: Date;
  payload?: string;
};

const notes: ReadonlyArray<{
  type: NoteType;
  message: string;
  payloadRegex: string;
}> = [
  {
    type: 'EmailVerified',
    message: 'verified',
    payloadRegex: emailRegex,
  },
  // The distinction here is that we assume that users who exist already in Sierra
  // are verified, because they must've used their registered email address to set a password
  {
    type: 'EmailAssumedVerified',
    message: 'assumed to be verified at login',
    payloadRegex: emailRegex,
  },
] as const;

const messages = Object.values(notes).map(({ message }) => message);
const payloadRegexes = Object.values(notes).map(
  ({ payloadRegex }) => payloadRegex
);
const anyMessageRegex = messages.join('|');
const anyPayloadRegex = payloadRegexes.map((regex) => `(?:${regex})`).join('|');

// This matches a note where:
// - it begins with the prefix (Auth0:)
// - optionally, there is a payload corresponding to one of the regexes above (captured in group `payload`)
// - that is followed by one of the messages (captured in group `message`)
// - it ends with an ISO 8601 datetime string (captured in group `date`)
const auth0NoteRegex = new RegExp(
  `^${auth0NotePrefix}\\s+(?<payload>${anyPayloadRegex})\\s+(?<message>${anyMessageRegex})\\s+(?<date>${isoDateRegex})\$`
);

export const getAuth0Note = (note: string): Note | undefined => {
  const match = note.match(auth0NoteRegex);
  if (!match || !match.groups) {
    return undefined;
  }

  const { payload, message, date: dateString } = match.groups;
  const date = new Date(dateString);
  const type = notes.find((n) => n.message === message)?.type;
  if (!type || isNaN(date.getDate())) {
    return undefined;
  }

  return { type, date, payload };
};

export const createAuth0Note = ({
  type,
  payload,
  date = new Date(),
}: Note): string =>
  [
    auth0NotePrefix,
    payload,
    notes.find((n) => n.type === type)!.message,
    date.toISOString(),
  ].join(' ');
