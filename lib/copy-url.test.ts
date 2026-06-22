import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyCurrentUrl } from './copy-url';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('copyCurrentUrl', () => {
  it('writes the current URL to the clipboard and shows a toast', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    copyCurrentUrl();
    await flush();

    expect(writeText).toHaveBeenCalledWith(window.location.href);

    const toast = document.body.querySelector('div');
    expect(toast?.textContent).toBe('URL copied');
  });

  it('falls back to execCommand when the Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    // jsdom doesn't implement execCommand, so assign a mock directly.
    const execCommand = vi.fn(() => true);
    document.execCommand = execCommand;

    copyCurrentUrl();
    await flush();

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.body.querySelector('div')?.textContent).toBe('URL copied');
  });

  it('shows a failure toast when copying does not succeed', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    document.execCommand = vi.fn(() => false);

    copyCurrentUrl();
    await flush();

    expect(document.body.querySelector('div')?.textContent).toBe('Copy failed');
  });
});
