import { resolve         } from 'path'
import { fileExists      } from '../files.js'
import { context         } from '../context.js'
import { normalizeConfig } from '../config.js'

import { dependencies, pascalPkgName,  name } from '../pkg.js'

const pkgFullName = name;

import consola from 'consola'

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
  const { DB_WIDGET_BUILD, DB_WIDGET_MOUNT_BUILD, DB_WIDGET_TEST_BUILD } = process.env

  const { widget, testWidget } = config

  if(widget && DB_WIDGET_BUILD)       return testWidget && DB_WIDGET_TEST_BUILD? `dev/es/preview/widget/index.js` : `widget/index.js`
  if(widget && DB_WIDGET_MOUNT_BUILD) return testWidget && DB_WIDGET_TEST_BUILD? `dev/es/preview/widget/mount.js` : `widget/mount.js`

  return isMinified(config)? `index.min.js` : `index.js`
}

export const getDistDir = (config) => (format) => {
  const { DB_WIDGET_BUILD, DB_WIDGET_MOUNT_BUILD } = process.env
  const { widget         , testWidget            } = config

  if((widget || testWidget) && (DB_WIDGET_BUILD || DB_WIDGET_MOUNT_BUILD)) 
    return  `dist`

  return  isMinified(config)? `dist/${format}` : `dist/dev/${format}`
}

export const getViteRollupConfig = (passedConfig) => {
  const { DB_EMPTY_OUT_DIR, DB_WIDGET_BUILD, DB_WIDGET_MOUNT_BUILD, DB_WIDGET_TEST_BUILD, COPY_PUBLIC_DIR='false', PREVIEW, WIDGET_PREVIEW, DB_FORMAT='es' } = process.env

  const copyPublicDir = COPY_PUBLIC_DIR && COPY_PUBLIC_DIR.includes('true')? true : false

  const config      = normalizeConfig(passedConfig)

  const preview     = getPreview(config.preview)

  const minify      = isMinified(config)

  const outDir      = getDistDir(config)(DB_FORMAT)
  const emptyOutDir =  DB_EMPTY_OUT_DIR === 'false' || !DB_EMPTY_OUT_DIR? false : true
  const sourcemap   = minify && !DB_WIDGET_BUILD && !DB_WIDGET_MOUNT_BUILD

  const entry        = getEntry()
  const formats      = [DB_FORMAT]

  const name         = pascalPkgName
  const fileName     = getDistBuildFileNameFunction(config)
  const external     = Array.from(new Set([...(config.external||[]), pkgFullName, 'https://esm.sh/@scbd/self-embedding-component']))
  const globals      = config.globals || {}
  const optimizeDeps = { exclude:  [pkgFullName] }

  const define = { ...config.define,  DB_WIDGET_BUILD, DB_WIDGET_MOUNT_BUILD, DB_WIDGET_TEST_BUILD, 'process.env.NODE_ENV': '"production"' }

  return { copyPublicDir,  preview , outDir, define, globals, external, minify, emptyOutDir, sourcemap, entry, formats, name, fileName, optimizeDeps }
}

const previewDefault = {
  cors      : false,
  port      : 5000,
  strictPort: true,
  widgetOpen: '/preview/widget/index.html',
  open      : '/preview/index.html'
}

function getPreview(preview){
  const { port, cors, strictPort, open:openBuild, widgetOpen} = preview || previewDefault
  const { WIDGET_PREVIEW } = process.env

  const open =  WIDGET_PREVIEW? widgetOpen : openBuild

  return { port, cors, strictPort, open}
}