import { createFilter, defineConfig } from 'vite'
import type { Plugin } from 'vite';
import uni from '@dcloudio/vite-plugin-uni'
import Inspect from 'vite-plugin-inspect'
import path from 'path';
import { mainTsPlugin } from './config/vite-plugin-setup-main-ts';

const resolve = (dir) => path.resolve(process.cwd(), dir);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni({
      mp: {
        vendorConfig: /module\/index/,
      },
    }),

    mainTsPlugin({
      include: resolve('src/main.ts'),
      pre: `import { test } from '@/module';`,
      post: `console.log('app', app);`
    }),

  
    Inspect({
      build: process.argv?.includes('debug'),
      outputDir: '.vite-inspect',
    }),
  ],
  server: {
    port: 8081
  }
})
