import   ejs          from 'ejs'
import   express      from 'express'
import   cors         from 'cors'
import   consola      from 'consola'
import   portfinder   from 'portfinder'
import   changeCase   from 'change-case'
import { spawnSync }  from 'child_process'

import { context                } from '../util/context.js'
import { pascalPkgName, pkgName } from '../util/pkg.js'

const { COMP_ID }   = process.env
const globalOpts    = {}
const componentId   = COMP_ID || pkgName
const componentName = COMP_ID? changeCase.pascalCase(COMP_ID): pascalPkgName

const rootMap = {
  widget    : 'dist/widget',
  testWidget: 'public/widget'
}

export const serve = async (rootName = 'testWidget') => {
  const app = express()

  app.use(cors())

  const port = await portfinder.getPortPromise({ port: 8089, stopPort: 8888 })

  app.use(express.static(context))
  
  app.get('/demo', (req, res) => res.send(ejs.render(demoHtml({ port, rootName }))))
  app.get('/legacy', (req, res) => res.send(ejs.render(demoHtml({ port, rootName }, true))))

  app.listen(port)
  
  consola.info(`\n  listening port: ${port} serving the  dir as root`)

  globalOpts.app = app
  open(port)
}

export const demoHtml = ({ port, rootName }, legacy = false) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>${componentName} self embedding widget demo</title>
  </head>
  <body>
    <div id="no-server" style="visibility: hidden"> <h1>Sorry there is no server running at http://localhost:8088</h1></div>

    ${scripts({ port, rootName }, legacy)}
  </body>
</html>
`

function open(port){
  const options = {  shell: true }

  spawnSync('open', [ '-a', '/Applications/Google\\', 'Chrome.app', `http://localhost:${port}/legacy` ], options)
  spawnSync('open', [ '-a', '/Applications/Google\\', 'Chrome.app', `http://localhost:${port}/demo` ], options)
}

function scripts(opts, legacy){
  return legacy? widgetScriptsLegacy(opts) : widgetScripts(opts)
}

function widgetScripts ({ port, rootName }){
  return `
    <script nomodule="" id="${componentId}-legacy" src="http://localhost:${port}/${rootMap[rootName]}/index.umd.js"></script>
    <script  type="module" id="${componentId}" src="http://localhost:${port}/${rootMap[rootName]}/index.js"></script>`
}

function widgetScriptsLegacy ({ port, rootName  }){
  return `    <script id="${componentId}-legacy" src="http://192.168.0.112:${port}/${rootMap[rootName]}/index.umd.js"></script>`
}
