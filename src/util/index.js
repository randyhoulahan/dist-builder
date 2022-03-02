export { context, dist, src                        } from './context.js'
export { pkg, defaultPkg, applyPkgDefaults, writePkg, pkgName, fileNamePreFix, getPackageVersion, pascalPkgName, isVueComponent, dependencies, external  } from './pkg.js'


export { forEachFileRecursive, replaceInFile, hasVue, hasCss, pushInFile } from './files.js'


import * as Config from './config.js'

export const getConfig = Config.getConfig
export const config    = Config.config

export { getCommand   , getArgs    , getAllUserArgs                } from './commands.js'

export { runTaskAndNotify, notifyDone, notifyStartTask, notifyEndTask, startFeedback, endFeedback, startTaskInfo, endTaskInfo, taskError } from './cli-feedback.js'

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))



export { viteConfig } from './vite/index.js'
