import { describe, expect, it } from 'vitest';
import { nextDailyTrigger, selectTabIdsToClose } from './close-ungrouped-tabs';

describe('selectTabIdsToClose', () => {
  it('closes ungrouped, unpinned tabs', () => {
    const tabs = [
      { id: 1, groupId: -1, pinned: false },
      { id: 2, groupId: -1, pinned: false },
    ];
    expect(selectTabIdsToClose(tabs)).toEqual([1, 2]);
  });

  it('spares tabs that belong to a group', () => {
    const tabs = [
      { id: 1, groupId: 7, pinned: false },
      { id: 2, groupId: -1, pinned: false },
    ];
    expect(selectTabIdsToClose(tabs)).toEqual([2]);
  });

  it('spares pinned tabs even when ungrouped', () => {
    const tabs = [
      { id: 1, groupId: -1, pinned: true },
      { id: 2, groupId: -1, pinned: false },
    ];
    expect(selectTabIdsToClose(tabs)).toEqual([2]);
  });

  it('skips tabs without an id', () => {
    const tabs = [
      { groupId: -1, pinned: false },
      { id: 2, groupId: -1, pinned: false },
    ];
    expect(selectTabIdsToClose(tabs)).toEqual([2]);
  });

  it('returns an empty array when nothing qualifies', () => {
    const tabs = [
      { id: 1, groupId: 3, pinned: false },
      { id: 2, groupId: -1, pinned: true },
    ];
    expect(selectTabIdsToClose(tabs)).toEqual([]);
  });
});

describe('nextDailyTrigger', () => {
  it('returns today when the time is still in the future', () => {
    const now = new Date(2026, 5, 22, 5, 0, 0).getTime(); // 05:00
    const expected = new Date(2026, 5, 22, 6, 0, 0).getTime(); // 06:00 today
    expect(nextDailyTrigger(now, '06:00')).toBe(expected);
  });

  it('rolls to tomorrow when the time has already passed', () => {
    const now = new Date(2026, 5, 22, 7, 0, 0).getTime(); // 07:00
    const expected = new Date(2026, 5, 23, 6, 0, 0).getTime(); // 06:00 tomorrow
    expect(nextDailyTrigger(now, '06:00')).toBe(expected);
  });

  it('rolls to tomorrow when now equals the target time exactly', () => {
    const now = new Date(2026, 5, 22, 6, 0, 0).getTime(); // exactly 06:00
    const expected = new Date(2026, 5, 23, 6, 0, 0).getTime();
    expect(nextDailyTrigger(now, '06:00')).toBe(expected);
  });
});
