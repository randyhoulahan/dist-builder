import { spawnSync                             } from 'child_process'
import { notifyDone     , runTaskAndNotify     } from '../util/index.js'
import { buildTestWidget, buildTestWidgetMount } from './build-test-widget.js'

export default async (isForkedProcess = true) => {
  const run = runTaskAndNotify(isForkedProcess)

  await run(build, 'Building distribution')

  notifyDone(isForkedProcess)()
}

export async function buildBrowser(isDev = false, empty = false){
  const DB_MINIFY =  !isDev
  const env       = { ...process.env, DB_EMPTY_OUT_DIR: empty, DB_BROWSER_BUILD: true }

  if(DB_MINIFY) env.DB_MINIFY = DB_MINIFY

  const args      = []
  const options = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build',args, options)
}

function buildDev(){
  const env     = { ...process.env, DB_EMPTY_OUT_DIR: false }
  const args    = []
  const options = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
  buildMjs(true)
  buildBrowser(true)
  buildCjsFileExt(true)

  buildTestWidget()
  buildTestWidgetMount()
}

function build(){

  buildDev()

  // const env     = { ...process.env, DB_MINIFY: true, DB_EMPTY_OUT_DIR: false }
  // const args    = []
  // const options = { env, shell: true, stdio: 'inherit' }

  // spawnSync('yarn vite build', args, options)
  // buildMjs(false)
  // buildBrowser(false)
  // buildCjsFileExt(false)

  // buildWidget()
  // buildWidgetMount()
}

function buildMjs(isDev = false){
  const DB_MINIFY =  !isDev
  const env       = { ...process.env, DB_EMPTY_OUT_DIR: false, DB_MJS_BUILD: true }

  if(DB_MINIFY) env.DB_MINIFY = DB_MINIFY

  const args    = []
  const options = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
}



function buildCjsFileExt(isDev = false){
  const DB_MINIFY =  !isDev
  const env       = {...process.env,  DB_EMPTY_OUT_DIR: false, DB_CJS_BUILD: true }

  if(DB_MINIFY) env.DB_MINIFY = DB_MINIFY

  const args      = []
  const options   = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build',args, options)
}



function buildWidget(){
  const DB_ENTRY  = 'src/widget.js'
  const env       = { ...process.env,DB_ENTRY, DB_WIDGET_BUILD: true, DB_MINIFY: false, DB_EMPTY_OUT_DIR: false,  DB_BROWSER_BUILD: true }

  const args      = []
  const options   = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
}

function buildWidgetMount(){
  const DB_ENTRY  = 'src/widget-mount.js'
  const env       = { ...process.env, DB_ENTRY, DB_WIDGET_MOUNT_BUILD: true, DB_MINIFY: false, DB_EMPTY_OUT_DIR: false }

  const args      = []
  const options   = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
}
