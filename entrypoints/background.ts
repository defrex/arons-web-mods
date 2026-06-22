import { copyCurrentUrl } from '@/lib/copy-url';
import {
  ALARM_NAME,
  cleanupEnabled,
  closeUngroupedTabs,
  cleanupTime,
  rescheduleCleanup,
} from '@/lib/close-ungrouped-tabs';

export default defineBackground(() => {
  // The background service worker. Reserved for cross-mod coordination such as
  // storage, messaging, context menus, or commands (global keyboard shortcuts).
  // Individual page tweaks live in their own `*.content.ts` entrypoints.

  // --- Close ungrouped tabs: daily sweep driven by the alarms API. ---
  // Arm the alarm on install and on each browser startup (the latter also lets
  // an alarm missed while the browser was closed fire shortly after launch).
  browser.runtime.onInstalled.addListener(() => void rescheduleCleanup());
  browser.runtime.onStartup.addListener(() => void rescheduleCleanup());

  // Re-arm immediately when the popup changes the schedule or toggle.
  cleanupEnabled.watch(() => void rescheduleCleanup());
  cleanupTime.watch(() => void rescheduleCleanup());

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARM_NAME) return;
    if (!(await cleanupEnabled.getValue())) return;
    await closeUngroupedTabs();
  });

  browser.commands.onCommand.addListener(async (command) => {
    if (command !== 'copy-url') return;

    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyCurrentUrl,
      });
    } catch (err) {
      // Expected on restricted pages (chrome://, the web store, the new tab
      // page) where content can't be injected.
      console.error('copy-url: cannot run on this page', err);
    }
  });
});
