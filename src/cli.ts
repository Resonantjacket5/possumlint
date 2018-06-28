#!/usr/bin/env node
import { possum } from './parse'
import * as fs from 'fs'
import { Printer } from './ast'
const [,, ... args] = process.argv
function main () {
  console.log(args)
  let filePath = args[0]
  let verbose = args[1]
  let text = fs.readFileSync(filePath,'utf8');
  if (verbose) {
    console.log(possum.tokenize(text))
  }
  
  let output = possum.parse(text)
  // console.log(output)
  let p = new Printer()
  p.print(output)
}
main()