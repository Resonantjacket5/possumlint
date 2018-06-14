//import Parser from 'jison';
// http://zaa.ch/jison/docs/#usage-from-the-command-line
// https://stackoverflow.com/questions/28638304/jison-grammar-definition-leads-to-wrong-token-recognition
// https://hacks.mozilla.org/2013/05/compiling-to-javascript-and-debugging-with-source-maps/

// http://docs.groovy-lang.org/next/html/documentation/core-syntax.html#_characters

// Start conditions and some cool macros
// https://stackoverflow.com/questions/25889540/jison-start-conditions-with-json-format

// example bnf
// https://tc39.github.io/ecma262/

fs = require("fs");
var Parser = require("jison").Parser;
print = function (text) {
  process.stdout.write(text);
  process.stdout.write("\n");
}
var grammer = {
  "lex" :{
    "macros": {
      "ASCII": "a-zA-Z",
      "DIGIT": "0-9",
      "ALNUM": "{ASCII}{DIGIT}"
    },
    "startConditions":{
      "COMMENT":"// single line comments",
      "MULTI_COMMENT": "/* multi-line comments",
    },
    "rules":[
      //["$","return 'EOF'"],

      ["\\s+","/* skip whitespace */"],
      ["\\n+","/* skip newlines   */"],

      [['INITIAL'],"//","this.pushState('COMMENT')"],
      [['COMMENT'],"[^\*\\n]","// eat comment in chunks"],
      [['COMMENT'],"\\n","this.popState()"],
      // /\\*, /\*, /*
      // [['INITIAL'],"/\\*","this.pushState('MULTI_COMMENT')"],
      // [['MULTI_COMMENT'],"[^\*\\n]","// eat comment in chunks"],
      // [['MULTI_COMMENT'],"\\n","// eat line"],
      // [['MULTI_COMMENT'],"\\*/","this.popState()"],


      ["[a-zA-Z][a-zA-Z0-9]*","print(yytext);return 'ID'"],
      // ["[{ASCII}][{ALNUM}]*","print(yytext);return 'ID'"],
      // ["[_|$|ASCII][ALNUM]*","return 'ID'"],
      ["[0-9][0-9]+", "return 'NUM';"],

      [";", "return ';'"],

      ["\\\(","return '('"],
      ["\\\)","return ')'"],
      ["\\\{","return '{'"],
      ["\\\}","return '}'"],
      // simplified return string
      [
        "\'.*\'",
        "return 'STRING'",
      ],
      [
        "\".*\"",
        "return 'STRING'",
      ],
    ]
  },
  "bnf": {
    "STATEMENTS": [
      "STATEMENTS ; STATEMENT",
      "STATEMENT",
    ],
    "STATEMENT": [
      "ID = EXP",
      "EXP",
    ],
    "EXP": [
      "FUNC_EXP",
      "NUM",
      "STRING",
    ],
    "FUNC_EXP": [
      "ID ( EXP ) { STATEMENTS }",
      "ID { STATEMENTS }",
      "ID ( EXP )",
      "ID EXP",
      "ID ( )",
    ],
    "ID":[
      "ID . ID"
    ]
  }
}

var parser = new Parser(grammer);

// module.exports.add = (a,b) => a+b
module.exports.parser = parser
var parserSource = parser.generate();

// var output = parser.parse("1 2 3");
// console.log(output)

// output = parser.parse("1 2 3");
// console.log(output);

parser.parse("13");
parser.parse("one ( 13 )");
var sourceFile = fs.readFileSync('test/simple3b','utf8');
print(sourceFile);
var output = parser.parse(sourceFile)