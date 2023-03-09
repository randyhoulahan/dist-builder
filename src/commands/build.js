import { spawnSync                             } from 'child_process'
import { notifyDone     , runTaskAndNotify     } from '../util/index.js'
import { buildTestWidget, buildTestWidgetMount } from './build-test-widget.js'
import { makeMap } from './import-maps.js'
import consola from 'consola'

export default async (isForkedProcess = true) => {
  const run = runTaskAndNotify(isForkedProcess)

  await run(buildProd, 'Building distribution')

  notifyDone(isForkedProcess)()
}

// export async function buildBrowser(isDev = false, empty = false){
//   const DB_MINIFY =  !isDev
//   const env       = { ...process.env, DB_EMPTY_OUT_DIR: empty, DB_BROWSER_BUILD: true, DB_FORMAT: 'es', DB_BUILD: 'browser' }

//   if(DB_MINIFY) env.DB_MINIFY = DB_MINIFY

//   const args    = []
//   const options = { env, shell: true, stdio: 'inherit' }

//   spawnSync('yarn vite build',args, options)
// }

function buildDev(){
  build(true)
  buildTestWidget()
  buildTestWidgetMount()
}

async function buildProd(){
  buildDev()
  build()
  buildWidget()
  buildWidgetMount()
  await makeMap()
}

export function build(isDev = false){
  const DB_MINIFY       = !isDev
  const COPY_PUBLIC_DIR = isDev
  const env       = { ...process.env, COPY_PUBLIC_DIR, DB_EMPTY_OUT_DIR: true, DB_FORMAT: 'es', DB_BUILD: 'ssr'}

  if(DB_MINIFY) env.DB_MINIFY = DB_MINIFY

  const args    = []
  const options = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
}

function buildMjs(isDev = false){
  const DB_MINIFY =  !isDev
  const env       = { ...process.env, DB_EMPTY_OUT_DIR: true, DB_MJS_BUILD: true, DB_FORMAT: 'es', DB_BUILD: 'mjs' }

  if(DB_MINIFY) env.DB_MINIFY = DB_MINIFY

  const args    = []
  const options = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
}

function buildWidget(){
  const DB_ENTRY  = 'src/widget.js'
  const env       = { ...process.env,DB_ENTRY, DB_WIDGET_BUILD: true, DB_MINIFY: false, DB_EMPTY_OUT_DIR: false,  DB_BROWSER_BUILD: true, DB_FORMAT: 'es', DB_BUILD: 'widget' }

  const args      = []
  const options   = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
}

function buildWidgetMount(){
  const DB_ENTRY  = 'src/widget-mount.js'
  const env       = { ...process.env, DB_ENTRY, DB_WIDGET_MOUNT_BUILD: true, DB_MINIFY: false, DB_EMPTY_OUT_DIR: false, DB_FORMAT: 'es', DB_BUILD: 'widgetMount' }

  const args      = []
  const options   = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
}
