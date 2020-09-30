import { initPkg } from './pkg.js'
import { configFilePath, mkScriptsDir, mkConfigFile, mkRollupFile, mkBrowserList  } from './config.js'

import { notifyDone, notifyStartTask, notifyEndTask } from '../util/index.js'

let isForked = true

export const init = (isForkedProcess) => {
  isForked = isForkedProcess

  runTaskAndNotify(initPkg,       'initializing package.json export and other defaults')
  runTaskAndNotify(mkScriptsDir,  'creating scripts dir')
  runTaskAndNotify(mkConfigFile,  'creating default config')
  runTaskAndNotify(mkRollupFile,  'creating default rollup config')
  runTaskAndNotify(mkBrowserList, 'creating browser list defaults')

  notifyDone(isForked)()
}

export { initPkg, configFilePath, mkScriptsDir, mkConfigFile, mkRollupFile, mkBrowserList }

function runTaskAndNotify(task, text){
  notifyStartTask(isForked)(text)
  task()
  notifyEndTask(isForked)(text)
}