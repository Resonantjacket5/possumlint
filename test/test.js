// const parser = require('../parse.js').parser

/*function print(text){
    process.stdout.write(text);
    process.stdout.write("\n");
}*/
const fs = require("fs");
const parser = require('../built/parse').parser
const lexer = require('../built/parse').lexer
const monitor = require('../built/parse').monitor
const possum = require('../built/parse').possum

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
    //'test/simple3c',
]


for (file of files) {
    let sourceFile = fs.readFileSync(file,'utf8');
    console.log(file)
    console.log("--------------")
    console.log(sourceFile)
    monitor.reset()
    let tokens = lexer.lexus(sourceFile)
    // let tokens = possum.tokenize(sourceFile)
    
    console.log('Tokens:')
    console.log(tokens)

    monitor.reset()
    let output = parser.parse(sourceFile)
    console.log(output)
}

console.log('Test:success')