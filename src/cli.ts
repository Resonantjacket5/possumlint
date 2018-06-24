import { possum } from './parse'
import * as fs from 'fs'
const [,, ... args] = process.argv
function main () {
  console.log(args)

  // let jenkinsFile = "one ( 12 ) \n "

  // let tokens = possum.tokenize(jenkinsFile)
  // console.log(tokens)

  // let output = possum.parse(jenkinsFile)
  // console.log(output)
  let filePath = args[0]
  let text = fs.readFileSync(filePath,'utf8');
  console.log(possum.tokenize(text))
  let output = possum.parse(text)
  console.log(output)
}
main()