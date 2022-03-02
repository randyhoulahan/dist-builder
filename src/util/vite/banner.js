import { name, cdn, version, license, author, repository, homepage, readme, description } from '../pkg.js'

const year   = new Date().getFullYear()

const desc = !description? '' :
  `
* ${description}
*`

const readMe = readme.includes('ERROR:')? '' : readme

const link = (homepage || readMe)? `
* @link ${homepage ||readMe}` : ''



const repo = repository? `
* @source ${repository}`: ''

const cdnLink = cdn? `
* @cdn ${cdn}`: ''

export const banner = `
/*!
* ${name} ${version}
* ${desc}${link}${repo}${cdnLink}
* @copyright (c) ${year} ${author.name || ''}
* @license ${license}
* 
* published: ${new Date()}
*/
`