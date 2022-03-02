import { resolve } from 'path'

export const context       = getContext()
export const src           = resolve(context, 'src'                  )
export const dist          = resolve(context, 'dist'                 )
export const pub           = resolve(context, 'public'               )
export const preview       = resolve(context, 'public/preview'       )
export const widgetPreview = resolve(context, 'public/preview/widget')
export const test          = resolve(context, 'tests'                )

function getContext(){
  const cxt = process.env.DIST_BUILDER_CONTEXT || process.env.INIT_CWD || process.argv[1].replace('/node_modules/.bin/dist-builder', '')

  return cxt
}