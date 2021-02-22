#!/usr/bin/env node
import { fork } from 'child_process'
import changeCase from 'change-case'
import consola from 'consola'
import { startFeedback, endFeedback, startTaskInfo, endTaskInfo, taskError, context } from '../src/util/index.js'

const commands = [ 'build', 'init', 'widget', 'testWidget', 'serveTestWidget', 'serveWidget' ]
const src      = 'node_modules/@houlagins/dist-builder/src/'

runCommand()

function runCommand(){
  const theCommand       = getCommand()

  startFeedback(`DIST-BUILDER: ${theCommand}`)

  runChildProcess(theCommand)
}

function runChildProcess(theCommand){
  let scriptPathToFork = ''

  if(theCommand === 'init')             scriptPathToFork = `${src}/init/run-as-child-process.js`
  if(theCommand === 'widget')           scriptPathToFork = `${src}/build/widget/run-as-child-process.js`
  if(theCommand === 'testWidget')       scriptPathToFork = `${src}/build/widget/run-as-child-process-test.js`
  if(theCommand === 'serveTestWidget')  scriptPathToFork = `${src}/serve-esm-local/run-as-child-process-test.js`
  if(theCommand === 'serveWidget')      scriptPathToFork = `${src}/serve-esm-local/run-as-child-process.js`

  if(scriptPathToFork)  return forkScript(scriptPathToFork)

  //build
  forkScript(`${src}/build/run-as-child-process.js`)
}

function forkScript(scriptPathToFork){
  const { DEBUG } = process.env
  const   env     = { ...process.env, DIST_BUILDER_CONTEXT: context }
  const   options = { cwd: context, env }

  consola.warn('context', context)
  if(DEBUG) options.stdio = 'inherit'

  const forked = fork(scriptPathToFork, ['--trace-warnings'], options)

  initChildProcessApi(forked)
}

function initChildProcessApi(forked){
  let toggle = true
  let done   = false

  forked.on('message', (text) => {
    if(done) return //do nothing else if done

    if(text === 'done'){ //child tells parent they are done
      done = true
      return endFeedback()
    }

    //child can only tell parent it is starting or ending a task
    if(toggle){ //starting task named text
      startTaskInfo(text)
      toggle = !toggle
      return
    }
    //ending task named text
    endTaskInfo(text)
    toggle = !toggle
  })

  forked.on('error', (error) => {
    taskError(error)
    done = true
    throw error
  })
}

function getCommand(){
  const theCommand = changeCase.camelCase(process.argv[2] || 'build')

  if(!isValidCommand(theCommand)) throw new Error('dist-builder: command passed not valid')

  return theCommand
}

function isValidCommand(theCommand){
  if (commands.includes(theCommand)) return true

  consola.error(`${theCommand}: is not a valid command.  One of ${JSON.stringify(commands)}.`)
  return false
}
