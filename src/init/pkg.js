import { pkg, defaultPkg, writePkg } from '../util/index.js'

export const initPkg = () => {
  const { bin, scripts, dependencies, devDependencies, browserslist, eslintConfig } = pkg
  const keepPkgOrder = { bin, scripts, dependencies, devDependencies, browserslist, eslintConfig }

  const newPkg = { ...pkg, ...defaultPkg, ...keepPkgOrder }

  for (const key in newPkg)
    if (!newPkg[key]) delete (newPkg[key])

  newPkg.scripts['build'] = 'dist-builder'
  writePkg(newPkg)
}