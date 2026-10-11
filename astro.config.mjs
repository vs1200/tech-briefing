// @ts-check
import { defineConfig } from 'astro/config';

import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import remarkCjkFriendly from 'remark-cjk-friendly';
import { remarkCallouts, remarkMermaid } from './src/lib/remark.ts';

// URL は将来変更できるよう環境変数で上書きする（GitHub Actions では configure-pages の出力を渡す）。
// 独自ドメインでは BASE_PATH が空になるため、SITE_URL が指定されたときは空をルートとして扱う。
const site = process.env.SITE_URL || 'https://vs1200.github.io';
const base = process.env.SITE_URL ? process.env.BASE_PATH || '/' : '/tech-briefing';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [react()],
  markdown: {
    // 既定の Sätteri は「**「強調」**が」のような日本語の強調を解釈できないため、remark と CJK 対応プラグインを使う
    processor: unified({ remarkPlugins: [remarkCjkFriendly, remarkMermaid, remarkCallouts] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
