import fs         from 'fs'
import path       from 'path'
import readPkg    from 'read-pkg'
import changeCase from 'change-case'

import { context } from './context.js'

export const pkgPath = () => {
  const thePkgPath = path.join(context, 'package.json')

  if (!fs.existsSync(thePkgPath)) throw new Error(`does not exist: ${thePkgPath}`)
  
  return thePkgPath
}

export const pkg = (() => {
  const thePkg = readPkg.sync({ cwd: context })

  delete(thePkg._id)
  return thePkg
})()

export const writePkg = (pkgObj) => {
  fs.writeFileSync(pkgPath(), JSON.stringify(pkgObj))
}

export const { name, version, license, dependencies, type, author={}, homepage, readme, description } = pkg

export const repository     = pkg.repository && pkg.repository.url? pkg.repository.url : ''
export const scopeLessName  = name.replace(new RegExp('@.+/', 'i'), '')
export const pascalPkgName  = changeCase.pascalCase(scopeLessName)
export const pkgName        = changeCase.paramCase(scopeLessName)
export const isComponent    = fs.existsSync(path.resolve(context, 'src/index.vue'))
export const fileNamePreFix = isComponent? pascalPkgName : pkgName
export const isModule       = type === 'module'

export const defaultPkg =
{
  version      : '0.0.1',
  private      : false,
  license      : 'MIT',
  main         : 'dist/esm/index.js',
  web          : 'dist/browser/index.min.js',
  umd          : 'dist/legacy/umd/index.umd.min.js',
  unpkg        : 'dist/browser/index.min.js',
  module       : 'dist/esm/index.min.js',
  'jsnext:main': 'dist/esm/index.min.js',
  src          : 'src/index.js',
  files        : [
    'dist/*',
    'src/*'
  ],
  browser: {
    './umd'    : 'dist/legacy/umd/index.umd.min.js',
    './browser': 'dist/browser/index.min.js',
    './'       : 'dist/browser/index.min.js'
  },
  exports: {
    '.': [
      {
        import : './dist/esm/index.js',
        require: './dist/legacy/cjs/index.common.cjs',
        default: './dist/esm/index.js'
      },
      './dist/legacy/umd/index.umd.min.js'
    ]
  }
}