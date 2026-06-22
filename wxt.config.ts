import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: "Aron's Web Mods",
    description: 'A personal collection of browser tweaks and mods.',
    permissions: [
      'storage',
      'activeTab',
      'scripting',
      'clipboardWrite',
      'tabs',
      'alarms',
    ],
    commands: {
      'copy-url': {
        suggested_key: {
          default: 'Ctrl+Shift+D',
          mac: 'Command+Shift+D',
        },
        description: 'Copy current page URL to clipboard',
      },
    },
  },
});
