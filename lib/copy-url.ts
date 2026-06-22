/**
 * Copies the current page's URL to the clipboard and shows a brief toast.
 *
 * IMPORTANT: this function is injected into the page via
 * `chrome.scripting.executeScript`, which serializes it with `.toString()`.
 * It must therefore be fully self-contained — no imports, and no references to
 * anything in module scope. Everything it needs is defined inside its body.
 */
export function copyCurrentUrl(): void {
  const url = location.href;

  const showToast = (message: string): void => {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '2147483647',
      padding: '10px 16px',
      borderRadius: '8px',
      background: 'rgba(20, 20, 20, 0.92)',
      color: '#fff',
      font: '500 13px system-ui, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 150ms ease',
    } satisfies Partial<CSSStyleDeclaration>);

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 200);
    }, 1200);
  };

  const fallbackCopy = (text: string): boolean => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let ok: boolean;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    textarea.remove();
    return ok;
  };

  const run = async (): Promise<void> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast('URL copied');
      } else if (fallbackCopy(url)) {
        showToast('URL copied');
      } else {
        showToast('Copy failed');
      }
    } catch {
      showToast(fallbackCopy(url) ? 'URL copied' : 'Copy failed');
    }
  };

  void run();
}
