export default {
  title: 'Vue3 Chessboard',
  description: 'A Vue 3 Chessboard component library.',
  themeConfig: {
    sidebar: [
      {
        text: 'Getting started',
        items: [{ text: 'Quick Start', link: '/getting-started' }],
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Board props', link: '/board-props' },
          { text: 'Callbacks', link: '/callbacks' },
        ],
      },
      {
        text: 'Events',
        items: [
          { text: 'Available Events', link: '/events/board-events' },
          { text: 'Board Created', link: '/events/board-created' },
          { text: 'Checkmate', link: '/events/checkmate' },
          { text: 'Stalemate', link: '/events/stalemate' },
          { text: 'Check', link: '/events/check' },
          { text: 'Move', link: '/events/move' },
          { text: 'Promotion', link: '/events/promotion' },
        ],
      },
      {
        text: 'Board API',
        items: [{ text: 'API', link: '/board-api' }],
      },
      {
        text: 'Contribute',
        items: [
          { text: 'Issues', link: '/issues' },
          { text: 'Contribute', link: '/contribute.md' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/qwerty084/vue3-chessboard' },
    ],
  },
};
