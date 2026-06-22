/**
 * Shared DOM helpers used by mods (content scripts).
 */

interface WaitForElementOptions {
  /** Give up and resolve `null` after this many milliseconds. */
  timeoutMs?: number;
  /** Element/document to search within. Defaults to `document`. */
  root?: Document | Element;
}

/**
 * Resolve the first element matching `selector`, waiting for it to appear if it
 * isn't in the DOM yet. Resolves `null` if it never shows up before the timeout.
 *
 * Most site tweaks need an element that's rendered after initial load, so this
 * is the workhorse for the content-script mods in this repo.
 */
export function waitForElement<T extends Element = Element>(
  selector: string,
  { timeoutMs = 5000, root = document }: WaitForElementOptions = {},
): Promise<T | null> {
  const existing = root.querySelector<T>(selector);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const el = root.querySelector<T>(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);

    const target = root instanceof Document ? root.documentElement : root;
    observer.observe(target, { childList: true, subtree: true });
  });
}
