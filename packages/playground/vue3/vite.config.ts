import { createFilter, defineConfig } from 'vite'
import type { Plugin } from 'vite';
import uni from '@dcloudio/vite-plugin-uni'
import Inspect from 'vite-plugin-inspect'
import path from 'path';
import { mainTsPlugin } from './config/vite-plugin-setup-main-ts';
import { splitVendorChunkPlugin } from 'vite';

const resolve = (dir) => path.resolve(process.cwd(), dir);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni({
      // mp: {
      //   vendorConfig: {
      //     'common/vendor': /module\/index/
      //   },
      // },
      h5: {
        commonChunk: ['common-vendor'],
        rollupOptions: {
          manualChunks(id){
            if(/uni-h5-vue/.test(id) || /vue-router/.test(id)){
              console.log('%c [ id ]-112', 'font-size:13px; background:pink; color:#bf2c9f;', id)
              return 'common-vendor'
            }

            if(/node_modules/.test(id)){
              return 'vendor'
            }
          }
        }
      }
    }),

    // mainTsPlugin({
    //   include: resolve('src/main.ts'),
    //   pre: `import { test } from '@/module';`,
    //   post: `console.log('app', app);`
    // }),

  
    Inspect({
      build: process.argv?.includes('debug'),
      outputDir: '.vite-inspect',
    }),
  ],
  server: {
    port: 8081
  }
})
