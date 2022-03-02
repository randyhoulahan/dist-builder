import { defineConfig        } from 'vite'
import { terser              } from 'rollup-plugin-terser'
import   vue                   from '@vitejs/plugin-vue'
import   postcss               from './postcss.js'
import { getViteRollupConfig } from './util.js'
import { banner              } from './banner.js'


const config = (config) => {
  const { define, globals, external, minify, emptyOutDir, sourcemap, entry, formats, name, fileName, optimizeDeps } = getViteRollupConfig(config)


  return defineConfig({
    optimizeDeps, define, 
    logLevel : 'info',
    preview: getPreview(),
    plugins  : [ vue() ],
    css      : { postcss },
    build    : {
                  emptyOutDir, minify, sourcemap,
                  lib      : { formats, entry, name, fileName }, // lib build as opposed to app build
                  rollupOptions: {
                    // make sure to externalize deps that shouldn't be bundled
                    // into your library
                    external,
                    output: {
                      banner,
                      exports: 'named',
                      // Provide global variables to use in the UMD build
                      // for externalized deps
                      globals: { vue: 'Vue', vueI18n: 'VueI18n', ...globals }
                    },
                    plugins: minify? [terser({ output: { comments: true } })] : []
                  },
                }
  })
}

export const viteConfig = config
export default viteConfig

function getPreview(){
  const { WIDGET_PREVIEW } = process.env

  return   {
    port: 5000,
    open: WIDGET_PREVIEW? '/preview/widget/index.html' : '/preview/index.html'
  }
}