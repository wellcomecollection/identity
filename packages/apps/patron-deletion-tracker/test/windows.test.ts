import { getSierraQueryOptions } from '../src/windows';
import {
  endOfYesterday,
  startOfToday,
  startOfYesterday,
  subDays,
} from 'date-fns';

describe('getSierraQueryOptions', () => {
  it('returns the options for the previous day by default', () => {
    const { start, end } = getSierraQueryOptions();
    expect(start).toEqual(startOfYesterday());
    expect(end).toEqual(endOfYesterday());
  });

  it('returns the options for a given duration', () => {
    const { start, end } = getSierraQueryOptions({ durationDays: 3 });
    expect(start).toEqual(subDays(startOfToday(), 3));
    expect(end).toEqual(endOfYesterday());
  });

  it('returns the options for a given start and duration', () => {
    const { start, end } = getSierraQueryOptions({
      start: '2020-01-01T00:00:00.000Z',
      durationDays: 10,
    });
    expect(start).toEqual(new Date('2020-01-01T00:00:00.000Z'));
    expect(end).toEqual(new Date('2020-01-11T23:59:59.999Z'));
  });

  it('returns the options for a given start and end string', () => {
    const { start, end } = getSierraQueryOptions({
      start: '2020-01-01T00:00:00.000Z',
      end: '2020-02-01T12:12:12.121Z',
    });
    expect(start).toEqual(new Date('2020-01-01T00:00:00.000Z'));
    expect(end).toEqual(new Date('2020-02-01T23:59:59.999Z'));
  });

  it('throws an error if config is insufficient', () => {
    expect(() =>
      getSierraQueryOptions({ end: '2020-01-01T00:00:00.000Z' })
    ).toThrow();
  });
});
