#!/usr/bin/env node
import { possum } from './parse'
import * as fs from 'fs'
const [,, ... args] = process.argv
function main () {
  console.log(args)
  let filePath = args[0]
  let text = fs.readFileSync(filePath,'utf8');
  console.log(possum.tokenize(text))
  let output = possum.parse(text)
  console.log(output)
}
main()