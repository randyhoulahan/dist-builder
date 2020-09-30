import consola from 'consola'

export const error = (msg, throwing = true) => {
  const theError = new Error(msg)
  

  if(!throwing) return consola.error(msg, theError)

  throw theError
}
