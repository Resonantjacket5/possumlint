//import Parser from 'jison';
// http://zaa.ch/jison/docs/#usage-from-the-command-line
var Parser = require("jison").Parser;

var grammer = {
  "lex" :{
    "rules":[
      //["$","return 'EOF'"],
      ["\\s+","/* skip whitespace */"],
      ["[0-9]+", "return 'NUM';"],
      ["\\\(","return '('"],
      ["\\\)","return ')'"],
      ["\\\{","return '{'"],
      ["\\\}","return '}'"],
      // simplified return string
      [
        "\'.*\'",
        "return 'STRING'",
      ],
    ]
  },
  "bnf": {
    "NUMS":[
      "NUMS NUM",
      "NUM"
    ]
  }
}

var parser = new Parser(grammer);

var parserSource = parser.generate();

var output = parser.parse("1 2 3");
console.log(output)

output = parser.parse("1 2 3");
console.log(output);