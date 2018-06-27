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
    // Returns Array<STATEMENT>
    // with STATEMENT as base rule
    // ex:  [STMT;] STMT; STMT; => [STMTS STMT;] STMT; => [STMTS STMT;] => STMT
    "STATEMENTS": [
      ["STATEMENTS STATEMENT ;","$$ = $1; $1.push($2)"],
      ["STATEMENT ;","$$ = [$1]"],
      // new yy.ASTStatements(@1,$2,$1)
      // new yy.ASTStatements(@1,$1)
    ],
    // Currently Statement just consist of expression
    "STATEMENT": [
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
      ["MEMBER ( ARGS ) { STATEMENTS }","$$ = new yy.ASTFuncExp(@1, $1, $3)"],
      ["MEMBER { STATEMENTS }","$$ = new yy.ASTFuncExp(@1, $1, $3)"],
      //["ID ( EXP )","$$ = new yy.ASTFuncExp(@1,$1,$3)"],
      ["MEMBER ( ARGS )","$$ = new yy.ASTFuncExp(@1, $1, $3)"],
      ["MEMBER ARGS","$$ = new yy.ASTFuncExp(@1, $1, $2)"],
      ["MEMBER ( )","$$ = new yy.ASTFuncExp(@1, $1)"],
    ],
    // Returns Array<EXP> value
    // with EXP as the base rule repeatedly matched 
    // ex:  [EXP], EXP, EXP => [ARGS, EXP], EXP => [ARGS, EXP] => ARGS
    "ARGS":[
      ["ARGS , EXP", "$$ = $1; $1.push($3)"],
      ["EXP","$$ = [$1]"]
    ],
    // ex: [ID] . ID . ID => [MEMBER . ID] . ID => [MEMBER] ID
    "MEMBER":[
      ["MEMBER . ID ", "$$ = new yy.MemExp(@1, $1, $3)"],
      "MEMBER [ ID ]",
      ["ID", "$$ = new yy.MemExp(@1, $1) "]
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
  let jenkinsFile = "one.two.three.four \n "
  let tokens = possum.tokenize(jenkinsFile)
  console.log(tokens)

  let output = possum.parse(jenkinsFile)
  console.log(output)
  console.log('j',output.children.stmt[0].children)
  // console.log('no')

  let p = new ASTPrinter()
  p.print(output)

  
}
main()