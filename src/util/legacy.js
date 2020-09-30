import { writeFileSync              } from 'fs'
import { resolve                    } from 'path'
import { replaceInFile, prePendFile } from './files.js'
import { src, context               } from './context.js'
import { isModule                   } from './pkg.js'

const babelConfigData   = `module.exports = { presets: [ [ \'@vue/cli-plugin-babel/preset\', { useBuiltIns: \'entry\' } ] ] }\n` // eslint-disable-line
const babelPolyfillData = `import \'@babel/polyfill\'\n`  // eslint-disable-line

export const initializeLegacyBuild = () => {
  const entryFileName = resolve(src, `index.${isModule? 'mjs' : 'js'}`)

  updateBabelConfig()
  injectBabelPolyfill(entryFileName)
}

export const destroyLegacyBuild = () => {
  const entryFileName = resolve(src, `index.${isModule? 'mjs' : 'js'}`)

  removeBabelPolyfill(entryFileName)
}

function updateBabelConfig(){
  const fileName = resolve(context, `babel.config.${isModule? 'cjs' : 'js'}`)

  writeFileSync(fileName, babelConfigData)
}

function injectBabelPolyfill(fileName){ prePendFile(fileName, babelPolyfillData) }

function removeBabelPolyfill(fileName){ replaceInFile(fileName, babelPolyfillData, '') }