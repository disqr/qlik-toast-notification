import { defineConfig } from 'vitepress';

const repo = 'https://github.com/disqr/qlik-toast-notification';

export default defineConfig({
  title: 'Toast Notification',
  description: 'Centrally managed Notifications for Qlik Cloud apps, by DI Squared.',
  base: '/qlik-toast-notification/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', type: 'image/png', href: '/qlik-toast-notification/favicon.png' }]],
  themeConfig: {
    logo: { light: '/logo-light.png', dark: '/logo-dark.png', alt: 'DI Squared' },
    siteTitle: 'Toast Notification',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'How it works', link: '/how-it-works' },
      { text: 'Download', link: `${repo}/releases/latest` },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Notifications Table', link: '/guide/notifications-table' },
          { text: 'Properties', link: '/guide/properties' },
          { text: 'Behavior', link: '/guide/behavior' },
          { text: 'Setup on many sheets', link: '/guide/many-sheets' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'How it works', link: '/how-it-works' },
          { text: 'Glossary', link: '/glossary' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: repo }],
    editLink: { pattern: `${repo}/edit/main/website/:path`, text: 'Edit this page on GitHub' },
    search: { provider: 'local' },
    footer: {
      message: 'Released under the MIT License. Not affiliated with or endorsed by Qlik.',
      copyright: '© 2026 <a href="https://disqr.com">DI Squared LLC</a>',
    },
  },
});
