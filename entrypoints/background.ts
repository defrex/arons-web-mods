import { copyCurrentUrl } from '@/lib/copy-url';

export default defineBackground(() => {
  // The background service worker. Reserved for cross-mod coordination such as
  // storage, messaging, context menus, or commands (global keyboard shortcuts).
  // Individual page tweaks live in their own `*.content.ts` entrypoints.

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
