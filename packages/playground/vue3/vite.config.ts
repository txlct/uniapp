import { createFilter, defineConfig } from 'vite'
import type { Plugin, BuildOptions } from 'vite';
import uni from '@dcloudio/vite-plugin-uni'
import Inspect from 'vite-plugin-inspect'
import path from 'path';
import createExternal from 'vite-plugin-external';
import externalGlobals from 'rollup-plugin-external-globals'

const resolve = (dir) => path.resolve(process.cwd(), dir);



const h5Option: BuildOptions['rollupOptions'] = {
      external: ['vue', 'vue-router'],
      plugins: [
        externalGlobals({
        vue: 'Vue',
        'vue-router': 'MyBundle.VueRouter'
      })]
  }

const build: BuildOptions = {

}

if(process.env.PAGE){
  h5Option.input = './build.html'

  build.assetsDir = 'asset-test'
}


// https://vitejs.dev/config/
export default defineConfig({
  build,
  plugins: [
    uni({
      mp: {
        vendorConfig: /module\/index/,
      },
      h5: {
        rollupOptions: h5Option,
        split: process.env.PAGE ? 'page': 'main'
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
  },
})
