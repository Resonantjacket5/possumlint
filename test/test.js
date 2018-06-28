// const parser = require('../parse.js').parser

/*function print(text){
    process.stdout.write(text);
    process.stdout.write("\n");
}*/
const fs = require("fs");
// const parser = require('../built/parse').parser
// const lexer = require('../built/parse').lexer
// const monitor = require('../built/parse').monitor
// const possum = require('../built/parse').possum
const possum = require('../built/parse').possum
const Printer = require('../built/ast').Printer

console.log('Run tests:\n--------------')

// https://github.com/jenkinsci/pipeline-examples/tree/master/declarative-examples/simple-examples

var files = [
  'test/simple1',
  'test/simple1b',
  'test/simple2',
  'test/simple2b',
  // slight regression
  'test/simple3',
  'test/simple3b',
  'test/simple3c',
  'test/property-access',
]


for (file of files) {
  let sourceFile = fs.readFileSync(file,'utf8');
  console.log(file)
  console.log("--------------")
  console.log(sourceFile)

  let tokens = possum.tokenize(sourceFile)
  
  console.log('Tokens:')
  console.log(tokens)

  let output = possum.parse(sourceFile)
  console.log(output)

  // let p = new ASTPrinter()
  // p.print(output)
  let p = new Printer()
  p.print(output)
}

console.log('Test:success')