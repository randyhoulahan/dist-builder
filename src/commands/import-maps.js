import { notifyDone          , runTaskAndNotify } from '../util/index.js'
import { pkg                                    } from '../util/pkg.js'
import { dist                                   } from '../util/context.js'
import { writeFile           , fileExists       } from '../util/files.js'
import { getDistBuilderConfig                   } from '../util/config.js'

export default async (isForkedProcess = true) => {
    const run = runTaskAndNotify(isForkedProcess)

    await run(() => makeMap(true, true), 'Building distribution for test widget')

    notifyDone(isForkedProcess)()
}

export async function makeMap(){
    const { external=[], importMapOverRide={}, importExtras={} } = (await getDistBuilderConfig()).distBuilderConfig

    const   imports              = {}
    const { dependencies, name, version } = pkg


    for (const key of Object.keys(dependencies)) {
        if(!external.includes(key)) continue;

        const versionOrLocation = dependencies[key]
        const isLocation        = versionOrLocation.includes('file:') || versionOrLocation.includes('git:')
        const version           = isLocation? '' : '@' + dependencies[key]

        imports[ key ]          = `https://esm.sh/${key}${version}`

        if(importMapOverRide[ key ])
            imports[ key ] = importMapOverRide[ key ]
    }

    for (const key of Object.keys(importExtras))
        imports[ key ] = importExtras[key]
    
    // if(imports['vue-demi'])  imports['vue-demi'] = imports['vue']

    imports[name] = `https://esm.sh/${name}@${version}`

    if(fileExists(`${dist}/dev/es`))
        writeFile(`${dist}/dev/es`, 'import-map.json', JSON.stringify({ imports }, null, 4))

    if(fileExists(`${dist}/es`))
        writeFile(`${dist}/es`, 'import-map.json', JSON.stringify({ imports }))

    if(fileExists(`${dist}`))
        writeFile(`${dist}`, 'import-map.json', JSON.stringify({ imports }))

    imports[name] = `http://localhost:5000/index.js`

    if(fileExists(`${dist}/dev/es/preview`))
        writeFile(`${dist}/dev/es/preview`, 'import-map.json', JSON.stringify({ imports }, null, 4))

    if(fileExists(`${dist}/dev/es/preview/widget`))
        writeFile(`${dist}/dev/es/preview/widget`, 'import-map.json', JSON.stringify({ imports }, null, 4))

}