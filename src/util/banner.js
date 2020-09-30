import { name, version, license, author, repository, homepage, readme, description } from './pkg.js'

const year   = new Date().getFullYear()

const desc = !description? '' :
  `
* ${description}
*`

export const banner = `/* eslint-disable */
/*!
* ${name} ${version}
* ${desc}
* @link ${homepage || readme}
* @source ${repository}
* @copyright (c) ${year} ${author.name || ''}
* @license ${license}
* 
*/
`