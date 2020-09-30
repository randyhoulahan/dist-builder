import   path                     from 'path'
import { pathToFileURL          } from 'url'
import { spawnSync              } from 'child_process'
import { configFilePath         } from '../../init/index.js'
import { buildModern, buildUmd  } from '../index.js'
import { getConfig              } from './config.js'
import { dist, context, taskError, notifyDone, runTaskAndNotify, src, embedCdnUrl, fileNamePreFix } from '../../util/index.js'

const widgetDistPath = path.resolve(dist, './widget')

export const build = async (isForkedProcess=true, WIDGET=true) => {
  const run    = runTaskAndNotify(isForkedProcess)
  const config = await deconstructConfig(isForkedProcess,  WIDGET)
  
  const { legacy, modern, legacyName, legacyEntry, legacyDest  } = config

  if(legacy)  await run(buildUmd, 'building legacy widget', { dest: legacyDest, entry: legacyEntry, name: legacyName })
  if(modern)  await run(buildModern, 'building modern widget', WIDGET)
  if(modern)  await run(useCdn, 'injecting cdn use for modern browser esm bundles', WIDGET)

  await run(rmDemo, 'removing demo file', { legacy, test: WIDGET==='test' })

  exit(isForkedProcess)
}

export const testBuild = (isForkedProcess=true, WIDGET='test') => {
  build(isForkedProcess, WIDGET)
}

async function useCdn (WIDGET){

  const { browserEsmPackages } = await getConfig()

  const test     = (WIDGET === 'test')
  const destPath = test? path.resolve(context, './public/widget/') : widgetDistPath
  
  embedCdnUrl(browserEsmPackages)(`${destPath}/index.js`)
  embedCdnUrl(browserEsmPackages)(`${destPath}/index.min.js`)
}

async function deconstructConfig(isForkedProcess, WIDGET){
  const test = WIDGET==='test'? true : false
  const   config               = (await import(pathToFileURL(configFilePath).href)).default
  const { widget, testWidget } = config

  if(!widget && !testWidget) exit(isForkedProcess, 'DIST-BUILDER: did not receive config to build a widget: ', configFilePath)

  const { legacy, modern, clean=true }          = (test? testWidget : widget) || {}
  const { legacyEntry, legacyDest, legacyName } = legacy? getLegacyParams(test? testWidget : widget, test) : {}
  const { modernEntry, modernDest, modernName } = modern? getModernParams(test? testWidget : widget, test) : {}


  return { legacy, modern, legacyEntry, legacyDest, legacyName, modernName, modernEntry, modernDest, clean }
}

function getParamsFromConfig(config, test, buildType='legacy'){
  const srcPath  = test? path.resolve(context, './tests/e2e/scaffolding/') : src
  const destPath = test? path.resolve(context, './public/widget/') : widgetDistPath

  const entry       = (buildType === 'legacy')? path.resolve(srcPath, './widget-legacy.js') : path.resolve(srcPath, './widget.js')
  const dest        = destPath
  const params      = { [`${buildType}Entry`]: entry, [`${buildType}Dest`]: dest }
  const configType  = typeof config

  if('boolean' === configType) return params
  if('string'  === configType) return { ...params, [`${buildType}Entry`]: config }
  if('object'  === configType) return config
}

function getLegacyParams({ legacy }, test){
  const config     = getParamsFromConfig(legacy, test)
  const legacyName = `${fileNamePreFix}${test? 'Test': ''}Widget`

  return { ...config, legacyName }
}

function getModernParams({ modern }, test){
  return getParamsFromConfig(modern, test, 'modern')
}

function exit(isForkedProcess, errMsg){
  if(errMsg) taskError(isForkedProcess)(errMsg)

  else notifyDone(isForkedProcess)(errMsg)
  process.exit(0)
}

function rmDemo({ legacy, test }){
  const { DEBUG   } =   process.env
  const   options   = { shell: true }

  if(DEBUG) options.stdio = 'inherit'

  if(!test && legacy?.umd) return spawnSync('rm', [ `${widgetDistPath}/demo.html` ], options)
  if(test) spawnSync('rm', [ path.resolve(context, './public/widget/demo.html') ], options)
}
