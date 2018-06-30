#!/usr/bin/env node
import { possum } from './possum'
import * as fs from 'fs'
import { Printer } from './ast'

import * as yaml from 'js-yaml'

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
  let p = new Printer()
  p.print(output)

  let doc = yaml.safeLoad(fs.readFileSync('./config/rules.yml', 'utf8'))
  console.log(doc)

}
main()