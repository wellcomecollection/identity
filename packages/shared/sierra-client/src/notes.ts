// The distinction here is that we assume that users who exist already in Sierra
// are verified, because they must've used their registered email address to set a password
type State = 'Verified' | 'AssumedVerified';

const tokens: Readonly<Record<string, State>> = {
  'assumed to be verified at login': 'AssumedVerified',
  verified: 'Verified',
};

// Just the reverse of the above
const states: Readonly<Record<State, string>> = Object.entries(tokens).reduce(
  (map, [key, value]) => ({ ...map, [value]: key }),
  {} as Record<State, string>
);

// See https://stackoverflow.com/a/3143231
// Matches ISO 8601 dates like YYYY-MM-DDTHH:MM:SS.SSSSZ
const isoDateRegex = `\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+(?:[+-][0-2]\\d:[0-5]\\d|Z)`;

const auth0NotePrefix = 'Auth0:';

// This matches a note where:
// - it begins with the prefix (Auth0:)
// - the prefix is followed by one of the descriptive tokens above (captured in group `token`)
// - it ends with an ISO 8601 datetime string (captured in group `date`)
const auth0NoteRegex = new RegExp(
  `^${auth0NotePrefix}\\s+(?<token>${Object.keys(tokens).join(
    '|'
  )})\\s+(?<date>${isoDateRegex})\$`
);

export const getAuth0Note = (note: string): [State, Date] | undefined => {
  if (!note.startsWith(auth0NotePrefix)) {
    return undefined;
  }

  const match = note.match(auth0NoteRegex);
  if (!match || !match.groups) {
    return undefined;
  }

  const token = match.groups.token;
  const date = new Date(match.groups.date);
  const state = tokens[token];
  if (!state || isNaN(date.getDate())) {
    return undefined;
  }

  return [state, date];
};

export const createAuth0Note = (
  state: State,
  date: Date = new Date()
): string => `${auth0NotePrefix} ${states[state]} ${date.toISOString()}`;
