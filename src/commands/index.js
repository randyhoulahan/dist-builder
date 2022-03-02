import { getAllUserArgs } from '../util/commands.js'

runTaskAsChildProcess()

async function runTaskAsChildProcess(){
  const { commandParamCase, commandArgs  } = getAllUserArgs()

  const taskFunction  = (await import(`./${commandParamCase}.js`)).default

  taskFunction(commandArgs)
}