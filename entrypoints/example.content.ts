import { waitForElement } from '@/lib/dom';

/**
 * Example mod — a template for new tweaks.
 *
 * Each mod is its own content script entrypoint, scoped to the sites it should
 * run on via `matches`. WXT derives the manifest (and host permissions) from
 * the files in this folder, so adding a mod is just adding a file.
 *
 * To create a new mod, copy this file to `entrypoints/<name>.content.ts`,
 * change `matches`, and write your tweak in `main()`.
 */
export default defineContentScript({
  matches: ['https://example.com/*'],
  async main() {
    const heading = await waitForElement<HTMLHeadingElement>('h1');
    if (heading) {
      heading.textContent = "✨ Modded by Aron's Web Mods";
    }
  },
});
