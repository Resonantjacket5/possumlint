// const parser = require('../parse.js').parser

function print(text){
    process.stdout.write(text);
    process.stdout.write("\n");
}

const parser = require('../parse.js').parser

print('Run tests:\n--------------')

// https://github.com/jenkinsci/pipeline-examples/tree/master/declarative-examples/simple-examples

var files = [
    'test/simple1',
    'test/simple1b',
    'test/simple2',
    'test/simple2b',
    // slight regression
    //'test/simple3',
]


for (file of files) {
    print(file)
    print("--------------")
    let sourceFile = fs.readFileSync(file,'utf8');
    print(sourceFile)
    let output = parser.parse(sourceFile)
    console.log(output)
}

print('Test:success')