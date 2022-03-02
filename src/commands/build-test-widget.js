import { buildBrowser                   } from './build.js'
import { spawnSync                      } from 'child_process'
import { notifyDone  , runTaskAndNotify } from '../util/index.js'

//spawn options
const   defaultOptions   = { shell: true }

export default async (isForkedProcess = true) => {
  const run = runTaskAndNotify(isForkedProcess)

  await run(build, 'Building distribution for test widget')

  notifyDone(isForkedProcess)()
}

export async function buildTestWidget(){
  const DB_ENTRY  = 'src/widget.js'
  const env       = { ...process.env,DB_ENTRY, DB_WIDGET_TEST_BUILD: true, DB_WIDGET_BUILD: true, DB_MINIFY: false, DB_EMPTY_OUT_DIR: false,  DB_BROWSER_BUILD: true }

  const args      = []
  const options   = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
}

export async function buildTestWidgetMount(){
  const DB_ENTRY  = 'src/widget-mount.js'
  const env       = { ...process.env, DB_ENTRY, DB_WIDGET_TEST_BUILD: true, DB_WIDGET_MOUNT_BUILD: true, DB_MINIFY: false, DB_EMPTY_OUT_DIR: false }

  const args      = []
  const options   = { env, shell: true, stdio: 'inherit' }

  spawnSync('yarn vite build', args, options)
}

function build(){
  buildBrowser(true, true)
  buildTestWidget()
  buildTestWidgetMount()
}