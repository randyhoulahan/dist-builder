import   path        from 'path'
import { spawnSync } from 'child_process'

import {
  getConfig,
  notifyDone,
  runTaskAndNotify,
  fileNamePreFix,
  dist,
  context,
  useCdn,
  pkg,
  pushInFile
} from '../util/index.js'


//spawn options
const   defaultOptions   = { shell: true }
const { DEBUG          } = process.env

export const buildModern = (WIDGET = '') => { buildBrowser(WIDGET); buildBrowserMin(WIDGET); }
export const buildCjs    = ({ formats='commonjs', dest='dist/legacy/cjs/', entry, name }={}) => buildLegacyBundle({ formats, dest, entry, name })
export const buildUmd    = ({ formats='umd,umd-min', dest='dist/legacy/umd/', entry, name }={}) => buildLegacyBundle({ formats, dest, entry, name })

export const build = async (isForkedProcess) => {
  const run = runTaskAndNotify(isForkedProcess)

  const { modern, ssr, umd, cjs, clean } = await getConfig()

  if(clean)   await run(cleanDist, 'cleaning dist directory', { modern, ssr, umd, cjs })

  if(cjs)     await run(buildCjs,    'building legacy cjs bundle')
  if(umd)     await run(buildUmd,    'building legacy umd bundle')
  if(umd)     await run(rmDemo,      'removing default demo file')

  if(ssr)     await run(buildSsr,    'building SSR (esm nodejs) bundles')
  if(modern)  await run(buildModern, 'building modern browser esm bundles')
  if(modern)  await run(useCdn,      'injecting cdn use for modern browser esm bundles')

  notifyDone(isForkedProcess)()
}

export const buildLegacyBundle = ({ formats='umd,umd-min', dest='dist/legacy/umd/', entry=getEntry(), name=fileNamePreFix }) => {
  const   env     = { ...process.env, ... { BROWSERSLIST_ENV: 'legacy' } }
  const   args    = [ 'build', '--target lib', '--mode production', '--inline-vue', '--report', `--name ${name}`, `--formats ${formats}`, `--dest ${dest}`, '--filename index', entry ]
  const   options = { ...defaultOptions, ...{ env } }

  if(DEBUG) options.stdio = 'inherit'

  spawnSync('yarn vue-cli-service', args, options)
}

function getEntry(){ return (pkg.type==='module')? 'src/index.mjs' :'src/index.js' }
function buildEsm(){ buildRollup() }
function buildEsmMjs(){ buildRollup({ FORCE_JS_EXT:true }) }
function buildSsr(){ buildEsm(); buildEsmMin(); buildSsrMjs(); pushInFile(path.resolve(dist, `esm/index.min.js`), '/* eslint-disable */'); }
function buildSsrMjs(){ buildEsmMjs(); buildEsmMinMjs(); }

function buildEsmMin(){
  const BROWSERSLIST_ENV = 'ssr'
  const MINIFY           = true

  buildRollup({ BROWSERSLIST_ENV, MINIFY })
}

function buildEsmMinMjs(){
  const BROWSERSLIST_ENV = 'ssr'
  const MINIFY           = true
  const FORCE_JS_EXT = true

  buildRollup({ BROWSERSLIST_ENV, MINIFY, FORCE_JS_EXT })
}

function buildBrowser(WIDGET){
  const BROWSERSLIST_ENV = 'modern'

  return buildRollup({ BROWSERSLIST_ENV, WIDGET })
}

function buildBrowserMin(WIDGET){
  const BROWSERSLIST_ENV = 'modern'
  const MINIFY           = true

  return buildRollup({ BROWSERSLIST_ENV, MINIFY, WIDGET })
}

function rmDemo(){
  return spawnSync('rm', [ `${path.resolve(dist, './legacy/umd')}/demo.html` ], defaultOptions)
}

function buildRollup({ BROWSERSLIST_ENV='ssr', MINIFY=false, WIDGET='', FORCE_JS_EXT, DIST_BUILDER_CONTEXT=context }={}, file = 'scripts/rollup.config.mjs'){
  const env  = { ...process.env, ... { BROWSERSLIST_ENV, DIST_BUILDER_CONTEXT } }
  const args = [ `--config ${file}` ]

  if(MINIFY) env.MINIFY = true
  if(WIDGET) env.WIDGET = WIDGET
  if(FORCE_JS_EXT) env.FORCE_JS_EXT = FORCE_JS_EXT

  const options = { ...defaultOptions, ...{ env } }

  if(DEBUG) options.stdio = 'inherit'

  spawnSync('yarn rollup', args, options)
}

function cleanDist({ modern, ssr, umd, cjs  }){  // eslint-disable-line
  spawnSync('rm',    [ '-rf', dist ], defaultOptions)
  spawnSync('mkdir', [ '-p', dist ],  defaultOptions)

  if (modern) spawnSync('mkdir', [ '-p', path.resolve(dist, 'browser') ], defaultOptions)
  if (ssr)    spawnSync('mkdir', [ '-p', path.resolve(dist, 'esm') ],     defaultOptions)
  if (ssr)    spawnSync('mkdir', [ '-p', path.resolve(dist, 'esm/mjs') ], defaultOptions)

  if(umd || cjs) spawnSync('mkdir', [ '-p', path.resolve(dist, './legacy') ], defaultOptions)
  if(umd)        spawnSync('mkdir', [ '-p', path.resolve(dist, './legacy/umd') ], defaultOptions)
  if(cjs)        spawnSync('mkdir', [ '-p', path.resolve(dist, './legacy/cjs') ], defaultOptions)
}
