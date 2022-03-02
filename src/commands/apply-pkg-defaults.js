import { applyPkgDefaults                   } from '../util/index.js'
import { notifyDone      , runTaskAndNotify } from '../util/index.js'


export default async (isForkedProcess = true) => {
  const run = runTaskAndNotify(isForkedProcess)

  await run(applyPkgDefaults, 'Applying package defaults')

  notifyDone(isForkedProcess)()
}