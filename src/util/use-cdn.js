import   path                                    from 'path'
import { forEachFileRecursive, replaceInFile, getJsFileObjs }   from './files.js'
import { dist      } from './context.js'
import { name      } from './pkg.js'
import { getConfig } from './config.js'

const pkgName = name
const dirPath = path.resolve(dist, 'browser')

export const useCdn = async () => {
  const { browserEsmPackages } = await getConfig()

  const callBack = embedCdnUrl(browserEsmPackages)
  const options  = { callBack }
  
  await forEachFileRecursive(dirPath, options)
  await fixEsmChunks()

  return
}

export const embedCdnUrl = (browserEsmPackages) => (fileName) => {
  for (const name in browserEsmPackages){
    const isNotMinFile = !fileName.includes('.min')
    const isKnownToHaveMinFiles = browserEsmPackages[name].includes('@scbd') ||  browserEsmPackages[name].includes('@action-agenda') || browserEsmPackages[name].includes('@houlagins')

    const cdnUrl = isNotMinFile && isKnownToHaveMinFiles? browserEsmPackages[name].replace('.min', '') : browserEsmPackages[name]

    replaceInFile(fileName, `'${name}`, `'${cdnUrl}`)
    replaceInFile(fileName, `"${name}`, `"${cdnUrl}`)
  }
}

async function fixEsmChunks(){
  const { cdnUrl } = await getConfig()
  const   files    = await getJsFileObjs(dirPath)

  for (const { name, base } of files){
    if(name.includes('index') || name.includes('index')) continue

    if(name.includes('.min'))
      replaceInFile(path.normalize(path.resolve(dirPath, './index.min.js'), `./${base}`, `${cdnUrl}/${pkgName}/dist/browser/${base}`))
    else(!name.includes('.min'))
    replaceInFile(path.normalize(path.resolve(dirPath, './index.js'), `./${base}`, `${cdnUrl}/${pkgName}/dist/browser/${base}`))
  }
}