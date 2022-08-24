import { defineConfig        } from 'vite'
import { terser              } from 'rollup-plugin-terser'
import   vue                   from '@vitejs/plugin-vue'
import   postcss               from './postcss.js'
import { getViteRollupConfig } from './util.js'
import { banner              } from './banner.js'
// import vueI18n from '@intlify/vite-plugin-vue-i18n'

const config = (config) => {
  const { preview, outDir, define, globals, external, minify, emptyOutDir, sourcemap, entry, formats, name, fileName, optimizeDeps } = getViteRollupConfig(config)


  return defineConfig({
    optimizeDeps, define, 
    logLevel : 'info',
    preview: getPreview(preview),
    plugins  : [ vue() ],
    css      : { postcss },
    resolve: {
      dedupe: [
        'vue'
      ],
      preserveSymlinks: false
    },
    build    : {
                  outDir, emptyOutDir, minify, sourcemap,
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

const { WIDGET_PREVIEW } = process.env
const preview = {
  cors      : false,
  port      : 5000,
  strictPort: true,
  open      : WIDGET_PREVIEW? '/preview/widget/index.html' : '/preview/index.html'
}
function getPreview({ port, cors, strictPort, open} = preview){
  return { port, cors, strictPort, open}
}