/**
 * "Close ungrouped tabs" mod — a daily sweep that closes every tab not in a
 * tab group (pinned tabs are spared), keeping the browser tidy.
 *
 * This is background logic, not a content script: the schedule is driven by the
 * `alarms` API and the sweep by the `tabs` API. The pure helpers
 * (`selectTabIdsToClose`, `nextDailyTrigger`) are unit-tested; the impure
 * actions are wired up in `entrypoints/background.ts`.
 */

/** Name of the repeating alarm that triggers the daily sweep. */
export const ALARM_NAME = 'close-ungrouped-tabs';

/** `chrome.tabGroups.TAB_GROUP_ID_NONE` — the `groupId` of an ungrouped tab. */
const TAB_GROUP_ID_NONE = -1;

/** Whether the daily sweep is enabled. Defaults to on. */
export const cleanupEnabled = storage.defineItem<boolean>(
  'local:closeUngrouped.enabled',
  { fallback: true },
);

/** Local time of day to run the sweep, as a 24h `"HH:MM"` string. */
export const cleanupTime = storage.defineItem<string>(
  'local:closeUngrouped.time',
  { fallback: '06:00' },
);

/** Minimal shape of a tab needed to decide whether to close it. */
interface TabLike {
  id?: number;
  groupId?: number;
  pinned?: boolean;
}

/**
 * Given a list of tabs, return the ids of the ones to close: ungrouped
 * (`groupId === -1`) and not pinned. Tabs without an `id` are skipped.
 */
export function selectTabIdsToClose(tabs: TabLike[]): number[] {
  return tabs
    .filter(
      (tab) =>
        tab.id !== undefined &&
        tab.groupId === TAB_GROUP_ID_NONE &&
        !tab.pinned,
    )
    .map((tab) => tab.id as number);
}

/**
 * Epoch ms of the next occurrence of the local time `"HH:MM"` relative to
 * `now`. Returns today's instance if it's still in the future, otherwise
 * tomorrow's. Pure (takes `now`) so it's deterministic in tests.
 */
export function nextDailyTrigger(now: number, time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if (target.getTime() <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

/**
 * Close every ungrouped, unpinned tab across all windows. Returns the number of
 * tabs closed.
 */
export async function closeUngroupedTabs(): Promise<number> {
  try {
    const tabs = await browser.tabs.query({});
    const ids = selectTabIdsToClose(tabs);
    if (ids.length > 0) {
      await browser.tabs.remove(ids);
    }
    console.info(`close-ungrouped-tabs: closed ${ids.length} tab(s)`);
    return ids.length;
  } catch (err) {
    console.error('close-ungrouped-tabs: sweep failed', err);
    return 0;
  }
}

/**
 * Sync the alarm with the current settings: clear it when disabled, otherwise
 * (re)create it to fire next at the configured local time and repeat daily.
 * Call on install, on startup, and whenever a setting changes.
 */
export async function rescheduleCleanup(): Promise<void> {
  const enabled = await cleanupEnabled.getValue();
  if (!enabled) {
    await browser.alarms.clear(ALARM_NAME);
    return;
  }
  const time = await cleanupTime.getValue();
  browser.alarms.create(ALARM_NAME, {
    when: nextDailyTrigger(Date.now(), time),
    periodInMinutes: 24 * 60,
  });
}
