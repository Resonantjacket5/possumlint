import * as Jison from "jison"
import { Possum } from './possum'
import { ASTPrinter } from "./ast";
let grammar:Jison.grammar = {
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
      ["[\\s]+","if(yy.monitor.shouldSemiColon(yylloc)) {return ';'; } // whitespace"], //8
      //print('whitespace');console.log(yylloc);console.log('semi '+bark.monitor.shouldSemiColon(yylloc))
      //["[ \\r\\t]+","/* skip whitespace */"],
      //["\\n","console.log('newline '+yylloc.first_line);if(bark.monitor.shouldSemiColon(yylloc.first_line)){console.log('semicolon')} /*skip newlines   */"],
      [['INITIAL'],"//","this.pushState('COMMENT')"],
      [['COMMENT'],"[^*\\n]","// eat comment in chunks"], // 
      [['COMMENT'],"\\n","this.popState()"], // 11
      // /\\*, /\*, /*
      [['INITIAL'],"/\\*","this.pushState('MULTI_COMMENT')"],
      [['MULTI_COMMENT'],"[^*\\n]","// eat comment in chunks"],
      [['MULTI_COMMENT'],"\\n","// eat line"],
      [['MULTI_COMMENT'],"\\*/","this.popState()"],


      ["[a-zA-Z][a-zA-Z0-9]*","return 'ID'"], // 12
      // ["[{ASCII}][{ALNUM}]*","console.log(yytext);return 'ID'"],
      // ["[_|$|ASCII][ALNUM]*","return 'ID'"],
      ["[1-9][0-9]*", "return 'NUM';"],

      [";", "return ';'"],

      ["\\(","return '('"], 
      ["\\)","return ')'"], //14
      ["\\{","return '{'"],
      ["\\}","return '}'"], //16
      ["=","return '='"],
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
      ["STATEMENTS STATEMENT ;","$$ = new yy.ASTStatements(@1,$2,$1)"],
      ["STATEMENT ;","$$ = new yy.ASTStatements(@1,$1)"],
    ],
    // contains different kinda of expressions
    // but not all versions aka string wouldn't count
    "STATEMENT": [
      //"ID = EXP",
      ["EXP","$$ = new yy.ASTStatement(@1,$1)"],
    ],
    "EXP": [
      ["ASSIGN_EXP","$$ = new yy.ASTExp(@1, $1)"],
      ["FUNC_EXP","$$ = new yy.ASTExp(@1, $1)"],
      "LITERAL",
      // ["NUM"," $$ = new yy.ASTNumber(@1, yytext)"],
      // "STRING",
    ],
    // "CALLER":[
    //   "ID"
    // ],
    // "MEMBER":[
    //   "ID"
    // ],constructor(yylloc, callerNode, argNode)
    "ASSIGN_EXP": [
      //["ID = EXP", "$$ = new yy.ASTAssignExp(@1, $1, $3)"],
      "ID = EXP",
    ],
    "FUNC_EXP": [ 
      // not sure if groovy closure ones should be separate or not
      ["ID ( EXP ) { STATEMENTS }","$$ = new yy.ASTFuncExp(@1, $1, $3)"],
      ["ID { STATEMENTS }","$$ = new yy.ASTFuncExp(@1, $1, $3)"],
      //["ID ( EXP )","$$ = new yy.ASTFuncExp(@1,$1,$3)"],
      ["ID ( EXP )","$$ = new yy.ASTFuncExp(@1, $1, $3)"],
      ["ID EXP","$$ = new yy.ASTFuncExp(@1, $1, $2)"],
      ["ID ( )","$$ = new yy.ASTFuncExp(@1, $1)"],
    ],
    "LITERAL":[
      ["NUM","$$ = new yy.ASTNumber(@1, yytext)"],
      ["STRING","$$ = new yy.ASTString(@1, yytext)"]
    ]
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


export const possum = new Possum(grammar)

function main() {
  let jenkinsFile = "one ( five ( 2 ) ); \n "
  let tokens = possum.tokenize(jenkinsFile)
  console.log(tokens)

  let output = possum.parse(jenkinsFile)
  // console.log(output)
  // console.log('no')

  let p = new ASTPrinter()
  p.print(output)

  
}
main()