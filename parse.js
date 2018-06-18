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
  // use process.stdout.write for linux
  //process.stdout.write(text);
  //process.stdout.write("\n");
  console.log(text)
}

// global so callable in jison's bnf
bark = {}

class Monitor {
  constructor() {
    this.lastSymbol = false
    this.symbols = []
  }

  // return true if previous line number not same
  // as curLineNumber and last token was } or )
  shouldSemiColon(yylloc) {
    /*if (this.lastSymbol === false) {
      print('incorrect last symbol ')
      return false
    }*/
    if (yylloc.first_line === yylloc.last_line) {
      print('same line')
      return false
    }
    let lastVal = this.symbols[this.symbols.length-1]
    if(lastVal ===12 || lastVal === 14 || lastVal === 16) {
      // Both different line and correct symbol
      //console.log(`Added semicolon at ln:${yylloc.last_line} col${yylloc.last_column}`)
      console.log(`Matched: ${lastVal}`)
      console.log(`Added semicolon at ln:${yylloc.first_line} col:${yylloc.first_column}`)
      return true
    }
    print('wrong rule '+lastVal)
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

// r = (token) => {
//   print(this.yyloc)
//   print(this.parser.lexer.pastInput())
//   return token
// }

//print token function
pt = function (token,yylloc) {
  console.log(`<${token}> ln:${yylloc.first_line} col:${yylloc.first_column}`)
}


var grammer = {
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


      ["[a-zA-Z][a-zA-Z0-9]*","print('<id>: '+yytext+' '+yylloc.first_line);return 'ID'"], // 12
      // ["[{ASCII}][{ALNUM}]*","print(yytext);return 'ID'"],
      // ["[_|$|ASCII][ALNUM]*","return 'ID'"],
      ["[1-9][0-9]*", "pt('NUM',yylloc);return 'NUM';"],

      [";", "return ';'"],

      ["\\\(","return '('"], 
      ["\\\)","pt('(',yylloc);return ')'"], //14
      ["\\\{","return '{'"],
      ["\\\}","pt('}',yylloc);return '}'"], //16
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
      ["STATEMENTS STATEMENT ;","print('statements');$$ = new bark.ASTStatements(@1,$3,$1)"],
      ["STATEMENT ;","$$ = new bark.ASTStatements(@1,$1)"],
    ],
    // contains different kinda of expressions
    // but not all versions aka string wouldn't count
    "STATEMENT": [
      //"ID = EXP",
      ["FUNC_EXP","print('staement');$$ = new bark.ASTStatement(@1,$1)"],
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

parser = new Parser(grammer);
bark.parser = parser
print(parser.lexer)
//print(parser.lexer._currentRules())


bark.parser.lexer.lex = function lex () {
  // r is rule number matched
  var r = this.next();
  //console.log('r: '+r+' '+this.yylineno)
  // console.log(this.yylineno)

  bark.monitor.addRuleMatched(r)
  if (r) {
      return r;
  } else {
      return this.lex();
  }
}

// module.exports.add = (a,b) => a+b
module.exports.parser = parser
var parserSource = parser.generate();

// var output = parser.parse("1 2 3");
// console.log(output)

// output = parser.parse("1 2 3");
// console.log(output);

//parser.parse("13");
//parser.parse("one ( 13 )");
//let output = parser.parse("asdf (123); read(123); third(3213); four(4)");
//print(output)
// var sourceFile = fs.readFileSync('test/simple3b','utf8');
// print(sourceFile);
// var output = parser.parse(sourceFile)