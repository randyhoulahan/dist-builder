import { pathToFileURL           } from 'url'
import { knownBrowserEsmPackages } from './known-browser-esm-packages.js'


export const config = {}
export const getConfig = async () => {
  if(Object.keys(config).length) return config

  const { configFilePath } = await import('../init/index.js')
  const rawConfig = (await import(pathToFileURL(configFilePath).href)).default

  const { modern, ssr, legacy, widget, testWidget, clean = true, monoRepoName, browserEsmPackages = {} } = rawConfig

  const { cjs, umd                          } = legacy || {}
  const   hasEsmBuilds                        = modern || ssr
  const   hasLegacyBuilds                     = cjs    || umd
  const   hasEsmAndLegacyBuilds               = hasEsmBuilds && hasLegacyBuilds

  const allConfig =  { modern, ssr, legacy, clean, cjs, umd, hasEsmBuilds, hasLegacyBuilds, hasEsmAndLegacyBuilds, widget, testWidget, monoRepoName, browserEsmPackages: { ...knownBrowserEsmPackages, ...browserEsmPackages } }

  for (const key in allConfig)
    config[key] = allConfig[key]

  return config
}

getConfig()