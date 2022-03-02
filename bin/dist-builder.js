#!/usr/bin/env node
import { fork } from 'child_process'
import { startFeedback, endFeedback, startTaskInfo, endTaskInfo, taskError, context, getCommand  } from '../src/util/index.js'

runCommand()

function runCommand(){

  const theCommand = getCommand()

  startFeedback(`dist-builder: ${theCommand}`)

  runChildProcess(theCommand)
}


function runChildProcess(theCommand){
  const src = 'node_modules/@scbd/dist-builder/src/'

  return forkScript(`${src}/commands/index.js`)
}

function forkScript(scriptPathToFork){

  const { DEBUG } = process.env
  const   env     = { ...process.env, DIST_BUILDER_CONTEXT: context}
  const   argv    =  process.argv.slice(2)
  const   options = { cwd: context, env }

  options.stdio = 'inherit'

  const forked = fork(scriptPathToFork, ['--trace-warnings', ...argv ], options)

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