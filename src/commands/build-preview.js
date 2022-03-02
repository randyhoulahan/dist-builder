
import { notifyDone, runTaskAndNotify } from '../util/index.js'
import { buildBrowser } from './build.js'

export default async (isForkedProcess = true) => {
  const run = runTaskAndNotify(isForkedProcess)

  await run(()=>buildBrowser(true, true), 'Building distribution for test widget')

  notifyDone(isForkedProcess)()
}
