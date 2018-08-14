#!/usr/bin/env node

// Used to read files and convert to yaml
import * as fs from 'fs'
import * as yaml from 'js-yaml'

// main import
import { possum } from './possum'
import { Printer } from './ast'
import { TypeChecker } from './type'

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

  // let doc = yaml.safeLoad(fs.readFileSync('./config/rules.yml', 'utf8'))
  // console.log(doc)

  let tc = new TypeChecker(null, null)
  tc.nodecheck(output, [])
}
main()