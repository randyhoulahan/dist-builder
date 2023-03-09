import { defineConfig        } from 'vite'
import { terser              } from 'rollup-plugin-terser'
import { getViteRollupConfig } from './util.js'
import { banner              } from './banner.js'
import   vue                   from '@vitejs/plugin-vue'
import   postcss               from './postcss.js'
import { src }                 from '../context.js'

import consola from 'consola'


const alias = [ { find: '@', replacement: src } ]

const config = (config) => {
  const { copyPublicDir, preview, outDir, define, globals, external, minify, emptyOutDir, sourcemap, entry, formats, name, fileName, optimizeDeps } = getViteRollupConfig(config)

  const c = {
              optimizeDeps, define, 
              logLevel : 'info',
              preview,
              plugins  : [ vue() ],
              css      : { postcss },
              resolve: {
                alias,
                dedupe: [ 'vue' ],
                preserveSymlinks: false
              },
              build    : {
                            outDir, emptyOutDir, minify, sourcemap, copyPublicDir,
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
            }

  return defineConfig(c)
}

export const viteConfig = config
export default viteConfig

