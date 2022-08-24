import   fs                 from 'fs'
import   path               from 'path'
import { readPackageSync  } from 'read-pkg'
import   changeCase         from 'change-case'
import { writePackageSync } from 'write-pkg'

import { context } from './context.js'

export const pkgPath = () => {
  const thePkgPath = path.join(context, 'package.json')

  if (!fs.existsSync(thePkgPath)) throw new Error(`does not exist: ${thePkgPath}`)
  
  return thePkgPath
}

export const pkg = (() => {
  const thePkg = readPackageSync({ cwd: context })

  delete(thePkg._id)
  return thePkg
})()

export const writePkg = (pkgObj) => { writePackageSync(pkgPath(),pkgObj) }

export const name        = pkg.name
export const version     = pkg.version
export const license     = pkg.license
export const type        = pkg.type
export const author      = pkg.author || {}
export const homepage    = pkg.homepage
export const readme      = pkg.readme.includes('ERROR: No README')? '' : pkg.readme
export const description = pkg.description

export const repository     = pkg.repository && pkg.repository.url? pkg.repository.url : ''
export const scopeLessName  = name.replace(new RegExp('@|/', 'i'), '')
export const pascalPkgName  = changeCase.pascalCase(scopeLessName)
export const pkgName        = changeCase.paramCase(scopeLessName)
export const isVueComponent = fs.existsSync(path.resolve(context, 'src/index.vue'))
export const fileNamePreFix = isVueComponent? pascalPkgName : pkgName
export const isModule       = type === 'module'
export const cdn            = pkg.cdn
export const external       = Object.keys(pkg?.dependencies || {})
export const dependencies   = pkg.dependencies || {}

export const getPackageVersion = (name) => {
  if(!dependencies[name]) throw new Error(`dist-builder.getPackageVersion: NPM dependency not found: ${name}`)

  return dependencies[name]
}



export const defaultPkg =
{
  version      : '0.0.1',
  private      : false,
  license      : 'MIT',
  scripts      : {
    "dev": "vite",
    "build": "dist-builder build",
    "v-build": "vite build",
    "preview": "vite preview",
    "preview-widget": "dist-builder serve",
    "lint": "eslint '**/*.{ts,js}'",
    "clean-reinstall": "rm -f yarn.lock rm -f package-lock.json && rm -rf node_modules && CXXFLAGS=\"--std=c++17\" yarn install --force"
  },
  main         : 'dist/es/index.min.js',
  web          : 'dist/browser/index.min.js',
  umd          : 'dist/umd/index.min.js',
  unpkg        : 'dist/browser/index.min.js',
  jsdelivr     : 'dist/browser/index.min.js',
  module       : 'dist/es/index.min.js',
  'jsnext:main': 'dist/es/index.min.js',
  src          : 'src/index.js',
  files        : [
    'dist/*',
    'src/*'
  ],
  browser: {
    './cjs'    : 'dist/cjs/index.min.cjs',
    './mjs'    : 'dist/mjs/index.min.mjs',
    './umd'    : 'dist/umd/index.min.js',
    './browser': 'dist/browser/index.min.js',
    './style'  : 'dist/browser/style.css',
    './'       : 'dist/browser/index.min.js'
  },
  exports: {
    '.': [
      {
        import : './dist/es/index.min.js',
        require: './dist/cjs/index.cjs',
        style  : './dist/style.css',
        src    : './src',
        dist   : './dist',
        default: './dist/umd/index.min.js'
      },
      './dist/legacy/umd/index.umd.min.js'
    ]
  }
}


export const applyPkgDefaults = () => {

  const scripts = { ...(defaultPkg.scripts || {}), ...(pkg.scripts || {}) }

  const { name, version,type, description, readme, homepage, license, bin, main, web, umd, unpkg, jsdelivr, module,  src, files, browser, exports,dependencies, devDependencies } = { ...pkg, ...defaultPkg }

  const keepPkgOrder = { name, version,type, description, readme, homepage, license, scripts, bin,  main, web, umd, unpkg, jsdelivr, module,  src, files, browser, exports,dependencies, devDependencies }


  const newPkg = { ...pkg, ...defaultPkg, ...keepPkgOrder, dependencies, devDependencies  }

  delete newPkg.dependencies
  delete newPkg.devDependencies

  newPkg.dependencies    = dependencies
  newPkg.devDependencies = devDependencies

  for (const key in newPkg)
    if (!newPkg[key]) delete (newPkg[key])

  writePkg(newPkg)
}