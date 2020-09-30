import fs         from 'fs'
import path       from 'path'

import { context } from '../util/index.js'

// make script dir
export const scriptsDir    = path.join(context, 'scripts')
export const hasScriptsDir = () => fs.existsSync(scriptsDir)
export const mkScriptsDir  = () => hasScriptsDir()? undefined : fs.mkdirSync(scriptsDir)

// get dir of this file
export const initDefaultDir      = path.parse(import.meta.url).dir.replace('file://', '')

//make lib config default file
export const configDefaultFilePath = path.join(initDefaultDir, 'config-default.js')
export const configFilePath        = path.join(context, 'scripts', 'dist-builder.mjs')
export const hasConfigFile         = () => fs.existsSync(configFilePath)
export const mkConfigFile          = () => hasConfigFile()? undefined : fs.copyFileSync(configDefaultFilePath, configFilePath)

//make rollup config file
export const rollupDefaultFilePath = path.join(initDefaultDir, 'rollup-default.js')
export const rollupFilePath        = path.join(context, 'scripts', 'rollup.config.mjs')
export const hasRollupFile         = () => fs.existsSync(rollupFilePath)
export const mkRollupFile          = () => hasRollupFile()? undefined : fs.copyFileSync(rollupDefaultFilePath, rollupFilePath)

// make default browsers list file
export const browserListDefaultFilePath = path.join(initDefaultDir, 'browserlistrc-default.txt')
export const browserListFilePath        = path.join(context, '.browserslistrc')
export const mkBrowserList              = () => fs.copyFileSync(browserListDefaultFilePath, browserListFilePath)