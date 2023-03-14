import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import Inspect from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni({
      mp: {
        vendorConfig: {
          'common/vendor': /module\/index/,
        },
      },
    }),
    Inspect({
      build: process.argv?.includes('debug'),
      outputDir: '.vite-inspect',
    }),
  ],
})
