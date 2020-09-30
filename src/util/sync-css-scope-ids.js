import   fs                                    from 'fs'
import   path                                  from 'path'
import { dist                 }                from './context.js'
import { forEachFileRecursive, replaceInFile } from './files.js'


const vDataRegex  = /(?<=\[data-v-)(.{8})(?=])/

export const syncCssScope = async () => {
  const scopeIds = getScopeIds()

  if(!scopeIds) return

  await syncScopeInDir(scopeIds)
  await removeRedundantCssFiles()
}

export default syncCssScope


function syncScopeInDir({ toFindScopeId, toReplaceWithScopeId }){
  if(!fs.existsSync(dist)) return

  const callBack = (fileName) => replaceInFile(fileName, toFindScopeId, toReplaceWithScopeId)
  const options = { callBack }

  return forEachFileRecursive(dist, options)
}

function removeRedundantCssFiles(){
  const legacyDirName = path.resolve(dist, 'legacy')

  if(!fs.existsSync(legacyDirName)) return

  const options = { callBack: deleteFileIfCss }

  return forEachFileRecursive(legacyDirName, options)
}

function getScopeIds (){
  const mainCssFileName = path.resolve(dist, 'style.css')
  const hasCss          = fs.existsSync(mainCssFileName)

  if(!hasCss) return undefined // no sync needed

  const cjsFileName = path.resolve(dist, 'legacy/cjs/index.css')
  const umdFileName = path.resolve(dist, 'legacy/umd/index.css')

  const hasCjsCss        = fs.existsSync(cjsFileName)
  const hasUmdCss        = fs.existsSync(umdFileName)
  const toFindScopeId    = extractScopeIdFromFile(mainCssFileName)

  if(hasCjsCss) return { toReplaceWithScopeId: extractScopeIdFromFile(cjsFileName), toFindScopeId }
  if(hasUmdCss) return { toReplaceWithScopeId: extractScopeIdFromFile(umdFileName), toFindScopeId }

  return undefined
}

function extractScopeIdFromFile (fileName){
  const data = (fs.readFileSync(fileName)).toString()

  return data.match(vDataRegex)[0]
}

function deleteFileIfCss(fileName){
  if(getFileNameExtension(fileName) === '.css') fs.unlinkSync(fileName)
}

function getFileNameExtension(fileName){
  const { ext }  = path.parse(fileName)

  return ext
}