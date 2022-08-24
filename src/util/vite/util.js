import { resolve                        } from 'path'
import { fileExists                     } from '../files.js'
import { context                        } from '../context.js'
import { normalizeConfig                } from '../config.js'
import { dependencies   , pascalPkgName,  name } from '../pkg.js'


const pkgFullName = name;

import consola from 'consola'
import consolaGlobalInstance from 'consola'

export const getFormats = (config) => {
  const { browser, cjs, umd, ssr } = config
  const { DB_CJS_BUILD, DB_MJS_BUILD, DB_BROWSER_BUILD, DB_FORMAT_ES, DB_FORMAT_CJS, DB_FORMAT_UMD, DB_WIDGET_BUILD, DB_WIDGET_MOUNT_BUILD, DB_WIDGET_TEST_BUILD} = process.env
  
  const isMjsBuild     = ssr     && DB_MJS_BUILD     || false
  const isBrowserBuild = browser && DB_BROWSER_BUILD || false

  if(DB_WIDGET_BUILD || DB_WIDGET_MOUNT_BUILD || DB_WIDGET_TEST_BUILD) return ['es']
  if(isMjsBuild || isBrowserBuild) return ['es']

  const formats = []
  const isMJS   = DB_MJS_BUILD || false

  if(ssr && isMJS)                           return ['es']
  if((DB_FORMAT_CJS || cjs) && DB_CJS_BUILD) return ['cjs']

  if(DB_FORMAT_ES  || browser) formats.push('es')
  if(DB_FORMAT_CJS || cjs    ) formats.push('cjs')
  if(DB_FORMAT_UMD || umd    ) formats.push('umd')

  return formats
}

export const isMinified = (config) => {
  const { DB_MINIFY, DB_WIDGET_TEST_BUILD } = process.env
  const { minify } = config

  return DB_MINIFY && minify && !DB_WIDGET_TEST_BUILD  || false 
}

export const getEntry = () => {
  const mjsEntryFileName    = resolve(context, 'src/index.mjs')
  const jsEntryFileName     = resolve(context, 'src/index.js')
  const customEntryFileName = process.env.DB_ENTRY? resolve(context, process.env.DB_ENTRY) : undefined

  if(customEntryFileName && fileExists(customEntryFileName)) return customEntryFileName
  
  if(fileExists(mjsEntryFileName)) return mjsEntryFileName
  if(fileExists(jsEntryFileName))  return jsEntryFileName

  throw new Error('Dist-Builder ERROR: no entry file specified and default index.(js|mjs) not present')
}

export const getDistBuildFileNameFunction = (config) => (format) => {
  const { DB_CJS_BUILD, DB_MJS_BUILD, DB_BROWSER_BUILD, DB_WIDGET_BUILD, DB_WIDGET_MOUNT_BUILD, DB_WIDGET_TEST_BUILD } = process.env

  const { ssr, browser,  widget, testWidget } = config
  const   isEsFormat     = format === 'es'
  const   isMjsBuild     = isEsFormat && ssr     && DB_MJS_BUILD     || false
  const   isBrowserBuild = isEsFormat && browser && DB_BROWSER_BUILD || false

  if(widget && DB_WIDGET_BUILD)       return testWidget && DB_WIDGET_TEST_BUILD? `preview/widget/index.js` : `widget/index.js`
  if(widget && DB_WIDGET_MOUNT_BUILD) return testWidget && DB_WIDGET_TEST_BUILD? `preview/widget/mount.js` : `widget/mount.js`

  if(DB_CJS_BUILD && format === 'cjs') return isMinified(config)? `cjs-ex/index.min.cjs` : `cjs-ex/index.cjs`

  if(isBrowserBuild) return isMinified(config)? `browser/index.min.js`           : `browser/index.js`
  if(!isMjsBuild)    return isMinified(config)? `${format}/index.min.js`         : `${format}/index.js`
  if(isMjsBuild)     return isMinified(config)? `mjs/index.min.mjs`              : `mjs/index.mjs`

  return isMinified(config)? `${format}/index.min.js` : `${format}/index.js`
}

export const getViteRollupConfig = (passedConfig) => {
  const { DB_EMPTY_OUT_DIR, DB_WIDGET_BUILD, DB_WIDGET_MOUNT_BUILD, DB_WIDGET_TEST_BUILD, PREVIEW, WIDGET_PREVIEW } = process.env

  const config      = normalizeConfig(passedConfig)
  const minify      = isMinified(config)
  const outDir      = DB_WIDGET_TEST_BUILD || PREVIEW || WIDGET_PREVIEW?  'dist-dev':  minify? 'dist' : 'dist-dev'
  const emptyOutDir =  false//DB_EMPTY_OUT_DIR || false
  const sourcemap   = minify && !DB_WIDGET_BUILD && !DB_WIDGET_MOUNT_BUILD

  const entry        = getEntry()
  const formats      = getFormats(config)
  const name         = pascalPkgName
  const fileName     = getDistBuildFileNameFunction(config)
  const external     = Array.from(new Set([...(config.external||[]), pkgFullName, 'https://esm.sh/@scbd/self-embedding-component']))
  const globals      = config.globals || {}
  const optimizeDeps = { exclude:  [pkgFullName] }

  const __VUE_I18N_FULL_INSTALL__= false
  const __VUE_I18N_LEGACY_API__  = false
  const __INTLIFY_PROD_DEVTOOLS__= false

  //don't think build and i18n needed in define
  const define = { ...config.define,  DB_WIDGET_BUILD, DB_WIDGET_MOUNT_BUILD, DB_WIDGET_TEST_BUILD }

  return { preview: config.preview, outDir, define, globals, external, minify, emptyOutDir, sourcemap, entry, formats, name, fileName, optimizeDeps }
}


function getExternal(config){
  const { browser, imports } = config
  const { DB_BROWSER_BUILD } = process.env
  const   isBrowserBuild     = browser && DB_BROWSER_BUILD || false

  if(isBrowserBuild) return [ ...Object.keys(imports), pkgFullName ]

  return [...Object.keys(dependencies), pkgFullName]
}