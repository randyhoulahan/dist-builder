import { pathToFileURL } from 'url'
import { context       } from './context.js'
import { join          } from 'path'
import { readPackageSync     } from 'read-pkg'
import { name } from  './pkg.js'

const configFilePath = join(context, 'vite.config.js')


export const config  = {}

export const loadConfig = async () => {

  if(Object.keys(config).length) return config

  const rawConfig = (await import(pathToFileURL(configFilePath).href)).distBuilderConfig

  const { minify, modern, legacy, widget, testWidget, clean = true, browserEsmPackages = {}, cdnUrl = 'https://cdn.cbd.int', debug = true } = rawConfig || {}

  const { cjs    , umd } = legacy       || {}
  const { browser, ssr } = modern       || {}
  const hasEsmBuilds     = browser      || ssr
  const hasLegacyBuilds  = cjs          || umd
  const hasAllBuilds     = hasEsmBuilds && hasLegacyBuilds

  const allConfig = { minify, modern, ssr, browser, legacy, clean, cjs, umd, hasEsmBuilds, hasLegacyBuilds, hasAllBuilds, widget, testWidget, browserEsmPackages, cdnUrl, debug }

  for (const key in allConfig)
    config[key] = allConfig[key]

  return config
}

export const normalizeConfig = (passedConfig) => {

  if(Object.keys(config).length) return config

  const { globals, imports, minify, modern, legacy, widget, testWidget, clean = true, browserEsmPackages = {}, cdnUrl = 'https://cdn.cbd.int', debug = true } = passedConfig || {}

  const { cjs    , umd } = legacy       || {}
  const { browser, ssr } = modern       || {}
  const hasEsmBuilds     = browser      || ssr
  const hasLegacyBuilds  = cjs          || umd
  const hasAllBuilds     = hasEsmBuilds && hasLegacyBuilds

  const allConfig = { globals, imports, minify, modern, ssr, browser, legacy, clean, cjs, umd, hasEsmBuilds, hasLegacyBuilds, hasAllBuilds, widget, testWidget, browserEsmPackages, cdnUrl, debug }

  for (const key in allConfig)
    config[key] = allConfig[key]

  return config
}

export function getEsShimsUrl(){

  const { dependencies } = readPackageSync({ cwd: resolve(__dirname, '../../..') })
  const   version        = dependencies['es-module-shims']

  return `https://cdn.jsdelivr.net/npm/es-module-shims@${version}/dist/es-module-shims.js`
}

const cdnUrl = 'https://cdn.cbd.int'
export const getCssUrl = () => {
  return `${cdnUrl}/${name}/dist/style.css`
}

export const getWidgetMountUrl = () => {
  return `${cdnUrl}/${name}/dist/widget/mount.min.js`
}

export const getWidgetElementId = () => {
  return `widget-${pkgName}`
}

export const getImportMapCdnUrl = () => {
  return `${cdnUrl}/${name}/dist/import-map.json`
}