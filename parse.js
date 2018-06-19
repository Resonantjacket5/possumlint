// parse.js

// import file to call the parsing

fs = require("fs");
var Parser = require("jison").Parser;
var JisonLex = require("jison-lex");

// global so callable in jison's bnf
bark = {}

//import Parser from 'jison';
// http://zaa.ch/jison/docs/#usage-from-the-command-line
// https://stackoverflow.com/questions/28638304/jison-grammar-definition-leads-to-wrong-token-recognition
// https://hacks.mozilla.org/2013/05/compiling-to-javascript-and-debugging-with-source-maps/

// http://docs.groovy-lang.org/next/html/documentation/core-syntax.html#_characters

// Start conditions and some cool macros
// https://stackoverflow.com/questions/25889540/jison-start-conditions-with-json-format

// example bnf
// https://tc39.github.io/ecma262/



print = function (text) {
  // use process.stdout.write for linux
  //process.stdout.write(text);
  //process.stdout.write("\n");
  console.log(text)
}


class Monitor {
  constructor() {
    this.symbols = []
  }

  reset() {
    this.symbols = []
  }

  // return true if previous line number not same
  // as curLineNumber and last token was } or )
  shouldSemiColon(yylloc) {
    if (yylloc.first_line === yylloc.last_line) {
      //print('same line')
      return false
    }
    let lastVal = this.symbols[this.symbols.length-1]
    // 11 is string
    if(lastVal === 11| lastVal ===12 || lastVal === 14 || lastVal === 16) {
      // Both different line and correct symbol
      //console.log(`Added semicolon at ln:${yylloc.last_line} col${yylloc.last_column}`)
      //console.log(`Matched: ${lastVal}`)
      //console.log(`Added semicolon at ln:${yylloc.first_line} col:${yylloc.first_column}`)
      return true
    }
    //print('wrong rule '+lastVal)
    return false
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

class ASTTerminal extends ASTNode {
  constructor(symbol, yylloc, yytext) {
    super(symbol,  yylloc)
    this.text = yytext
  }

  toString() {
    return `<${this.symbol}> ${this.text} line:${this.line} col:${this.column}`
  }
}

class ASTNumber extends ASTTerminal {
  constructor(symbol, yylloc, yytext) {
    super(symbol, yylloc, yytext)
  }
}

class ASTExp extends ASTNode {
  constructor(yylloc, node) {
    super('EXP',yyloc)
    this.node = node
  }
}

class ASTFuncExp extends ASTTerminal {
  // argNode is optional
  constructor(yylloc, callerNode, argNode) {
    super('EXP', yylloc)
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
pt = function (token,yylloc) {
  console.log(`<${token}> ln:${yylloc.first_line} col:${yylloc.first_column}`)
}


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
      ["[\\s]+","if(bark.monitor.shouldSemiColon(yylloc)) {return ';'; } // whitespace"], //8
      //print('whitespace');console.log(yylloc);console.log('semi '+bark.monitor.shouldSemiColon(yylloc))
      //["[ \\r\\t]+","/* skip whitespace */"],
      //["\\n","print('newline '+yylloc.first_line);if(bark.monitor.shouldSemiColon(yylloc.first_line)){print('semicolon')} /*skip newlines   */"],
      [['INITIAL'],"//","this.pushState('COMMENT')"],
      [['COMMENT'],"[^\*\\n]","// eat comment in chunks"], // 
      [['COMMENT'],"\\n","this.popState()"], // 11
      // /\\*, /\*, /*
      // [['INITIAL'],"/\\*","this.pushState('MULTI_COMMENT')"],
      // [['MULTI_COMMENT'],"[^\*\\n]","// eat comment in chunks"],
      // [['MULTI_COMMENT'],"\\n","// eat line"],
      // [['MULTI_COMMENT'],"\\*/","this.popState()"],


      ["[a-zA-Z][a-zA-Z0-9]*","return 'ID'"], // 12
      // ["[{ASCII}][{ALNUM}]*","print(yytext);return 'ID'"],
      // ["[_|$|ASCII][ALNUM]*","return 'ID'"],
      ["[1-9][0-9]*", "return 'NUM';"],

      [";", "return ';'"],

      ["\\\(","return '('"], 
      ["\\\)","return ')'"], //14
      ["\\\{","return '{'"],
      ["\\\}","return '}'"], //16
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
      ["NUM","print('num exp'); $$ = new bark.ASTNumber('NUM',@1, yytext)"],
      "STRING",
    ],
    // "CALLER":[
    //   "ID"
    // ],
    // "MEMBER":[
    //   "ID"
    // ],
    "FUNC_EXP": [
      // not sure if groovy closure ones should be separate or not
      "ID ( EXP ) { STATEMENTS }",
      "ID { STATEMENTS }",
      //["ID ( EXP )","$$ = new bark.ASTFuncExp(@1,$1,$3)"],
      "ID ( EXP )",
      "ID EXP",
      "ID ( )",
    ],
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
  // console.log(r)
  if (r) {
      return r;
  } else {
      return this.lex();
  }
}


// deep clone grammar to prevent collisions with parser
let lexGrammar = JSON.parse(JSON.stringify(grammar.lex));
var lexer = new JisonLex(lexGrammar)//.lex)
lexer.lex = lex



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
lexer.lexus = lexus

parser = new Parser(grammar)
parser.lexer.lex = lex

function main () {

  let tokens = lexer.lexus("one ( )\n")
  console.log(tokens)

  bark.monitor.reset()
  parser.parse("one ( );")
}

//main()

// export parser out to other files
module.exports.parser = parser
module.exports.lexer = lexer
// refactor monitor to be part of main
module.exports.monitor = bark.monitor
