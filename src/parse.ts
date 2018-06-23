// parse.js

// import file to call the parsing

//const fs = require("fs");
import Jison = require("jison");
import JisonLex = require("jison-lex");

let Parser = Jison.Parser;

// global so callable in jison's bnf
// declare var bark;
global.bark = {};

//import Parser from 'jison';
// http://zaa.ch/jison/docs/#usage-from-the-command-line
// https://stackoverflow.com/questions/28638304/jison-grammar-definition-leads-to-wrong-token-recognition
// https://hacks.mozilla.org/2013/05/compiling-to-javascript-and-debugging-with-source-maps/

// http://docs.groovy-lang.org/next/html/documentation/core-syntax.html#_characters

// Start conditions and some cool macros
// https://stackoverflow.com/questions/25889540/jison-start-conditions-with-json-format

// example bnf
// https://tc39.github.io/ecma262/

// javascript functions
// https://github.com/estree/estree/blob/master/es5.md


// print = function (text) {
//   // use process.stdout.write for linux
//   //process.stdout.write(text);
//   //process.stdout.write("\n");
//   console.log(text)
// }


class Monitor {
  terminals: boolean = false
  constructor() {
    this.terminals = false // {}
    this.targetTokenNumbers = false // []
    this.symbols = []
  }

  reset() {
    this.symbols = []
  }

  // return true if previous line number not same
  // as curLineNumber and last token was } or )
  shouldSemiColon(yylloc) {
    if (this.terminals == false) {
      throw new Error('terminals not set')
    }
    if (yylloc.first_line === yylloc.last_line) {
      //console.log('same line')
      return false
    }
    let lastVal = this.symbols[this.symbols.length-1]
    if (this.targetTokenNumbers.includes(String(lastVal)))  {
      return true
    }
    return false
  }

  // pass in dictionar of terminals
  // terminals: hashmap<number,string>
  setUpTerminals(terminals) {
    this.terminals = terminals
    this.targetTokenNumbers = []
    let targetTerminals = ['ID','STRING',')','}']
    // for each target terminal
    //for (let targetTerminal of targetTerminals) {
    for (let terminalNumber in terminals) {
      let curTerminal = terminals[terminalNumber]
      if (targetTerminals.includes(curTerminal)) {
        this.targetTokenNumbers.push( terminalNumber)
      }
    }
  }

  addRuleMatched(rule) {
    // if not whitespace add rule
    if (rule !== 8) {
      this.symbols.push(rule)
    }
  }
}

bark.monitor = new Monitor();

class ASTPrinter {
  visit(node, action) {
    switch(node.symbol) {
      case 'STATEMENTS': {
        action(node)
      }
    }
  }
}

// instanceof will say if obj is class or in prototype chain

class ASTNode {
  // symbol is type of terminal
  constructor(symbol, yylloc) {
    this.symbol = symbol
    this.line = yylloc.first_line
    this.column = yylloc.first_column

    // for every node constructed monitor it
    //bark.monitor.addNode(symbol, yylloc)
  }

  toString() {
    return `<${this.symbol}> line:${this.line} col:${this.column}`
  }
}

class ASTLiteral extends ASTNode {
  constructor(symbol, yylloc, yytext) {
    super(symbol,  yylloc)
    this.text = yytext
  }

  toString() {
    return `<${this.symbol}> ${this.text} line:${this.line} col:${this.column}`
  }
}

class ASTNumber extends ASTLiteral {
  constructor( yylloc, yytext) {
    super('NUM', yylloc, yytext)
  }
}

class ASTString extends ASTLiteral {
  constructor( yylloc, yytext) {
    super('STRING',yylloc, yytext)
  }
}

class ASTExp extends ASTNode {
  constructor(yylloc, node) {
    super('EXP',yylloc)
    this.node = node
  }
}

class ASTFuncExp extends ASTNode {
  // argNode is optional
  constructor(yylloc, callerNode, argNode) {
    super('FUNC_EXP', yylloc)
    this.callerNode = callerNode
    if (argNode !== undefined) {
      this.argNode = argNode
    } else {
      this.argNode = null
    }
  }
}

class ASTStatement extends ASTNode {
  constructor(yyloc, node) {
    super('STATEMENT', yyloc)
    this.node = node
  }
}

// holds either both statements and statement
//              OR just statement
class ASTStatements extends ASTNode {
  // statements is optional
  constructor(yyloc, statement, statements) {
    super('STATEMENTS',yyloc)
    this.statement = statement
    if (statements !== undefined) {
      this.statements = statements
    } else {
      this.statements = null
    }
  }
}


bark.ASTNode = ASTNode
bark.ASTNumber = ASTNumber
bark.ASTFuncExp = ASTFuncExp
bark.ASTStatement = ASTStatement
bark.ASTStatements = ASTStatements

//print token function
// pt = function (token,yylloc) {
//   console.log(`<${token}> ln:${yylloc.first_line} col:${yylloc.first_column}`)
// }


var grammar = {
  "lex" :{
    "macros": {
      "ASCII": "a-zA-Z", //1
      "DIGIT": "0-9",
      "ALNUM": "{ASCII}{DIGIT}"
    },
    "startConditions":{
      "COMMENT":"// single line comments",
      "MULTI_COMMENT": "/* multi-line comments",//5
    },
    "rules":[
      ["$","return 'EOF'"], // 7?
      ["[\\s]+","if(this.monitor.shouldSemiColon(yylloc)) {return ';'; } // whitespace"], //8
      //print('whitespace');console.log(yylloc);console.log('semi '+bark.monitor.shouldSemiColon(yylloc))
      //["[ \\r\\t]+","/* skip whitespace */"],
      //["\\n","console.log('newline '+yylloc.first_line);if(bark.monitor.shouldSemiColon(yylloc.first_line)){console.log('semicolon')} /*skip newlines   */"],
      [['INITIAL'],"//","this.pushState('COMMENT')"],
      [['COMMENT'],"[^*\\n]","// eat comment in chunks"], // 
      [['COMMENT'],"\\n","this.popState()"], // 11
      // /\\*, /\*, /*
      // [['INITIAL'],"/\\*","this.pushState('MULTI_COMMENT')"],
      // [['MULTI_COMMENT'],"[^\*\\n]","// eat comment in chunks"],
      // [['MULTI_COMMENT'],"\\n","// eat line"],
      // [['MULTI_COMMENT'],"\\*/","this.popState()"],


      ["[a-zA-Z][a-zA-Z0-9]*","return 'ID'"], // 12
      // ["[{ASCII}][{ALNUM}]*","console.log(yytext);return 'ID'"],
      // ["[_|$|ASCII][ALNUM]*","return 'ID'"],
      ["[1-9][0-9]*", "return 'NUM';"],

      [";", "return ';'"],

      ["\\(","return '('"], 
      ["\\)","return ')'"], //14
      ["\\{","return '{'"],
      ["\\}","return '}'"], //16
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
    "ROOT" :[ 
      ["STATEMENTS EOF"," return $1"],
     //["STATEMENTS ; EOF"," return $1"],
    ],
    "STATEMENTS": [
      ["STATEMENTS STATEMENT ;","$$ = new bark.ASTStatements(@1,$3,$1)"],
      ["STATEMENT ;","$$ = new bark.ASTStatements(@1,$1)"],
    ],
    // contains different kinda of expressions
    // but not all versions aka string wouldn't count
    "STATEMENT": [
      //"ID = EXP",
      ["FUNC_EXP","$$ = new bark.ASTStatement(@1,$1)"],
    ],
    "EXP": [
      "FUNC_EXP",
      // "LITERAL",
      ["NUM"," console.log('yytext',yytext); console.log(this.monitor);$$ = new bark.ASTNumber(@1, yytext)"],
      "STRING",
    ],
    // "CALLER":[
    //   "ID"
    // ],
    // "MEMBER":[
    //   "ID"
    // ],constructor(yylloc, callerNode, argNode)
    "FUNC_EXP": [ 
      // not sure if groovy closure ones should be separate or not
      "ID ( EXP ) { STATEMENTS }",
      "ID { STATEMENTS }",
      //["ID ( EXP )","$$ = new bark.ASTFuncExp(@1,$1,$3)"],
      ["ID ( EXP )","$$ = new bark.ASTFuncExp(@1, $1, $3)"],
      "ID EXP",
      "ID ( )",
    ],
    // "LITERAL":[
    //   ["NUM","console.log('num exp'); $$ = new bark.ASTNumber(@1, yytext)"],
    //   "STRING",
    // ]
    // "ID":[
    //   "ID"
    // ]
    // https://tc39.github.io/ecma262/#sec-property-accessors
    // "ID":[ 
    //   "ID . ID"
    // ]
  }
}

// override built in lex in order to monitor
//  rules so we can know when to insert semicolons
function lex () {
  // r is rule number matched
  var r = this.next();
  bark.monitor.addRuleMatched(r)  
  if (r) {
      // console.log(r)
      // if(r in parser.terminals_) {
      //   let token = parser.terminals_[r]
      //   console.log(token)
      // }
      return r;
  } else {
      return this.lex();
  }
}

// deep clone grammar to prevent collisions with parser
let lexGrammar = JSON.parse(JSON.stringify(grammar.lex));
var lexer = new JisonLex(lexGrammar)//.lex)
// lexer.lex = lex
//lexer.setInput("one ( )\n")

// Takes in text and returns array of tokens
function lexus (text) {
  this.setInput(text)
  let tokens = []
  let token = this.lex()
  // iterate until no tokens left
  while(token !== 1) {
    tokens.push(token)
    token = this.lex()
  }
  return tokens
}
lexer.monitor = bark.monitor
lexer.lexus = lexus

let parser = new Parser(grammar)
parser.lexer.lex = lex
parser.lexer.monitor = bark.monitor
bark.monitor.setUpTerminals(parser.terminals_)
parser.bark = bark
console.log('parser',parser)
// Finished all Setup


function main () {

  let jenkinsFile = "one ( 12 )\n"

  let tokens = lexer.lexus(jenkinsFile)
  console.log(tokens)

  bark.monitor.reset()
  let output = parser.parse(jenkinsFile)
  console.log(output)

  // console.log(parser.terminals_)
}

main()

// export parser out to other files
module.exports.parser = parser
module.exports.lexer = lexer
// refactor monitor to be part of main
module.exports.monitor = bark.monitor
