
import { notifyDone, runTaskAndNotify } from '../util/index.js'
import { spawnSync                    } from 'child_process'
import { pkg                          } from '../util/pkg.js'
import {  fileExists, forEachFileRecursive       } from '../util/files.js'
import { dist, context                         } from '../util/context.js'
import fs from 'fs-extra'
import consola from 'consola'

export default async (args) => {
    const run = runTaskAndNotify(true)

    await run(() => releaseDev(args), 'Releasing to dev for testing')

    notifyDone(true)()
}


async function releaseDev(args = []) {
    const forceOverwrite    = args.includes('-f')
    const { name, version } = pkg
    const   options         = { env: process.env, shell: true }
    if(releaseDevExists() && !forceOverwrite) throw new Error(`${name}@${version} exists on dev`)

    if(!fileExists(dist)) throw new Error(`${name}@${version} has not been built to dist`)

    if(releaseDevExists() && forceOverwrite) spawnSync(`aws s3 rm --profile=scbd --recursive s3://scbd-components/${name}/${version}`, [], options)

    spawnSync(`cp -r ${dist} ${context}/dist-temp`, [] , options )
    spawnSync(`gzip -9 -r ${context}/dist-temp/*`, [] , options )

    const callBack = (fileName)=>{
        const dest = fileName.replace('.gz', '')

        if(fileName === dest ) return 
        fs.moveSync(fileName, dest)
    }

    await forEachFileRecursive(`${context}/dist-temp`, { callBack })


    spawnSync(`aws s3 sync --profile=scbd  ${context}/dist-temp s3://scbd-components/${name}@${version}/dist --exclude ".*" --exclude "*.DS_Store" --content-encoding "gzip"  --cache-control "86400" --acl "public-read"`, [], options)
    spawnSync(`rm -rf ${context}/dist-temp`, [], options)

}

function releaseDevExists() {
    const   env             = { ...process.env }
    const { name, version } = pkg
    const   args            = []
    const   options         = { env, shell: true }
    const   t               = (spawnSync(`aws s3 ls --profile=scbd  s3://scbd-components/${name}@${version}/dist`, args, options)).output.toString().length

    return t > 2
}