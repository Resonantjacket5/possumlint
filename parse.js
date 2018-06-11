//import Parser from 'jison';
// http://zaa.ch/jison/docs/#usage-from-the-command-line
var Parser = require("jison").Parser;

var grammer = {
  "lex" :{
    "rules":[
      ["\\s+","/* skip whitespace */"],
      ["[0-9]+", "return 'NUM';"]
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