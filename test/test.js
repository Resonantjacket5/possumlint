// const parser = require('../parse.js').parser

function print(text){
    process.stdout.write(text);
    process.stdout.write("\n");
}

const parser = require('../parse.js').parser

print('Run tests')

var sourceFile = fs.readFileSync('test/simple1','utf8');
print(sourceFile)
var output = parser.parse(sourceFile)
