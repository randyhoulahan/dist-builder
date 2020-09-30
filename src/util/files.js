import   fs          from 'fs'
import   path        from 'path'
import { dist, src } from './context.js'

export const hasVue = (dirToSearch = src) => dirContainsFileWithExt('.vue', dirToSearch)
export const hasCss = (dirToSearch = src) => dirContainsFileWithExt('.css', dirToSearch)

export const prePendFile = (fileName, data) => {
  const newData = data + (fs.readFileSync(fileName)).toString()

  return fs.writeFileSync(fileName, newData)
}

export async function forEachFileRecursive (dir, options){ // eslint-disable-line

  if(typeof dir === 'string') options.absBase = dir

  const dirFd = typeof dir === 'string'? await fs.promises.opendir(dir) : dir

  const { callBack, excludeExt, includeExt, absBase=dist } = options

  for await (const dirent of dirFd){
    const fileName = path.resolve(absBase, dirent.name)

    if(dirent.isDirectory()){
      await forEachFileRecursive(await fs.promises.opendir(fileName), { ...options, absBase: fileName })
      continue
    }

    const fileObj  = path.parse(fileName)

    if(includeExt && includeExt.includes(fileObj.ext)) return callBack(fileName)

    if(excludeExt && includeExt.includes(fileObj.ext)) continue

    callBack(fileName)
  }
}

export async function getJsFileObjs (dir){ // eslint-disable-line
  const fileObjs = []
  const dirFd = typeof dir === 'string'? await fs.promises.opendir(dir) : dir

  for await (const dirent of dirFd){
    const fileName = path.resolve(dist, dirent.name)

    if(dirent.isDirectory())continue

    const fileObj  = path.parse(fileName)

    if(fileObj.ext !=='.js') continue

    fileObjs.push(fileObj)
  }
  return fileObjs
}

export function pushInFile(fileName, dataToPush){
  const data         = (fs.readFileSync(fileName)).toString()

  const newData      = `${dataToPush} \n ${data}`

  return fs.writeFileSync(fileName, newData)
}

export function replaceInFile(fileName, scopeId, scopeIdReplacement){
  const data         = (fs.readFileSync(fileName)).toString()
  const scopeIdRegex = new RegExp(`${scopeId}`, 'g')
  const newData      = data.replace(scopeIdRegex, scopeIdReplacement)

  return fs.writeFileSync(fileName, newData)
}

export async function dirContainsFileWithExt(ext, dirToSearch = src){
  if(!ext.startsWith('.')) ext = `.${ext}`

  let isFileWithExt = false

  const callBack = (fileName) => {
    if(isFileWithExt) return
    if(fileName.includes(ext)) isFileWithExt = true
  }

  const options = { callBack }

  await forEachFileRecursive(dirToSearch, options)

  return isFileWithExt
}