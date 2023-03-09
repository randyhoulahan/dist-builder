import changeCase from 'change-case'
const  commands   = [ 'build','importMaps', 'buildTestWidget', 'applyPkgDefaults', 'releaseDev' ] 


export const getAllUserArgs = () => {
  const command          = getCommand()
  const commandParamCase = getCommand({ paramCase: true })
  const commandArgs      = getArgs()

  return { command, commandParamCase, commandArgs } 
}

export function getCommand({ paramCase } = { paramCase:false }){

  const hasTraceWarningsArg = process.argv.includes('--trace-warnings')
  const startIndex          = hasTraceWarningsArg       ? 3 : 2
  const theCommandOne       = process.argv[startIndex]  ? changeCase.camelCase(process.argv[ startIndex ])   : ''
  const theCommandTwo       = process.argv[startIndex+1]? changeCase.camelCase(process.argv[ startIndex+1 ]) : ''


  if(isValidCommand(theCommandOne)) return paramCase? changeCase.paramCase(theCommandOne) : theCommandOne
  if(isValidCommand(theCommandTwo)) return paramCase? changeCase.paramCase(theCommandTwo) : theCommandTwo
  
  throw new Error(`dist-builder: ${theCommandOne} or ${theCommandTwo} command passed not valid`)
}


export const getArgs = () => {
  for (const [index, value]  of process.argv.entries())
    if(isValidCommand(value))
      return process.argv.slice(index+1)
  
  return []
}

function isValidCommand(theCommand){
  if (commands.includes(theCommand)) return true

  return false
}