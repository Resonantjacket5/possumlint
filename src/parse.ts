import * as Jison from "jison"
import { Possum } from './possum'
import { ASTPrinter } from "./ast";
import { lex } from "./lex";
let grammar:Jison.grammar = {
  "lex" :lex,
  "bnf": {
    "ROOT" :[ 
      ["STATEMENTS EOF"," return new yy.ASTStatements(@1,$1)"],
     //["STATEMENTS ; EOF"," return $1"],
    ],
    "STATEMENTS": [
      ["STATEMENTS STATEMENT ;","$$ = $1; $1.push($2)"],
      ["STATEMENT ;","$$ = [$1]"],
      // new yy.ASTStatements(@1,$2,$1)
      // new yy.ASTStatements(@1,$1)
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
      "MEMBER",
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
      "MEMBER = EXP",
    ],
    "FUNC_EXP": [ 
      // not sure if groovy closure ones should be separate or not
      ["MEMBER ( EXP ) { STATEMENTS }","$$ = new yy.ASTFuncExp(@1, $1, $3)"],
      ["MEMBER { STATEMENTS }","$$ = new yy.ASTFuncExp(@1, $1, $3)"],
      //["ID ( EXP )","$$ = new yy.ASTFuncExp(@1,$1,$3)"],
      ["MEMBER ( EXP )","$$ = new yy.ASTFuncExp(@1, $1, $3)"],
      ["MEMBER EXP","$$ = new yy.ASTFuncExp(@1, $1, $2)"],
      ["MEMBER ( )","$$ = new yy.ASTFuncExp(@1, $1)"],
    ],
    "MEMBER":[
      "MEMBER . MEMBER ",
      "ID",
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
  let jenkinsFile = "one ( nest( 4) ); two(2); \n "
  let tokens = possum.tokenize(jenkinsFile)
  console.log(tokens)

  let output = possum.parse(jenkinsFile)
  console.log(output)
  // console.log('no')

  let p = new ASTPrinter()
  p.print(output)

  
}
main()