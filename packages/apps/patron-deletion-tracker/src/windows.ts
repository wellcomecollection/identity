import {
  addDays,
  endOfDay,
  endOfYesterday,
  startOfDay,
  startOfToday,
  subDays,
} from 'date-fns';

// Consumers can either specify a plain `durationDays`, in which case the window
// will cover that number of days preceding the current day, a `start` and a `durationDays`,
// or a `start` and an `end`
export type WindowConfig = {
  start?: string;
  durationDays?: number;
  end?: string;
};

const defaultConfig = { durationDays: 1 };

export const getSierraQueryOptions = (
  config: WindowConfig = defaultConfig
): { start: Date; end: Date } => {
  const start = new Date(config.start ?? '');
  const end = new Date(config.end ?? '');
  if (config.durationDays && isNaN(start.getTime())) {
    return {
      start: subDays(startOfToday(), config.durationDays),
      end: endOfYesterday(),
    };
  } else if (config.durationDays && !isNaN(start.getTime())) {
    return {
      start: startOfDay(start),
      end: endOfDay(addDays(start, config.durationDays)),
    };
  } else if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    return { start: startOfDay(start), end: endOfDay(end) };
  }
  throw new Error(
    'A window must have either a duration or a specified start and end'
  );
};
