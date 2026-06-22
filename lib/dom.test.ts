import { afterEach, describe, expect, it } from 'vitest';
import { waitForElement } from './dom';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('waitForElement', () => {
  it('resolves immediately when the element already exists', async () => {
    document.body.innerHTML = '<h1>hello</h1>';
    const el = await waitForElement<HTMLHeadingElement>('h1');
    expect(el?.textContent).toBe('hello');
  });

  it('resolves once a matching element is added later', async () => {
    const pending = waitForElement<HTMLParagraphElement>('p.late');
    setTimeout(() => {
      const p = document.createElement('p');
      p.className = 'late';
      p.textContent = 'arrived';
      document.body.appendChild(p);
    }, 10);

    const el = await pending;
    expect(el?.textContent).toBe('arrived');
  });

  it('resolves null when nothing matches before the timeout', async () => {
    const el = await waitForElement('.never', { timeoutMs: 20 });
    expect(el).toBeNull();
  });
});
