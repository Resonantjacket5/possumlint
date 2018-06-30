import * as Jison from "jison"
// import { Possum } from './possum'
import { lex } from "./lex";


export let grammar:Jison.grammar = {
  "lex" :lex,
  "bnf": {
    "ROOT" :[
      ["STATEMENTS EOF"," return new yy.Block(@1,$1)"],
    ],
    // Returns Array<STATEMENT>
    // with STATEMENT as base rule
    // ex:  [STMT;] STMT; STMT; => [STMTS STMT;] STMT; => [STMTS STMT;] => STMT
    "STATEMENTS": [
      ["STATEMENTS STATEMENT ;","$$ = $1; $1.push($2)"],
      ["STATEMENT ;","$$ = [$1]"],
    ],
    "STATEMENT": [
      ["EXP","$$ = new yy.Stmt(@1,$1)"],
    ],
    "EXP": [
      ["ASSIGN_EXP","$$ = $1"],
      ["FUNC_EXP","$$ = $1"],
      "MEMBER",
      "LITERAL",
    ],
    "ASSIGN_EXP": [
      ["MEMBER = EXP","$$ = new yy.AssignExp(@1, $1, $3)"],
    ],
    "FUNC_EXP": [ 
      ["MEMBER ( ARGS ) { STATEMENTS }","$$ = new yy.CallExp(@1, $1, $3, $6)"],
      ["MEMBER { STATEMENTS }","$$ = new yy.CallExp(@1, $1, undefined, $3)"],
      ["MEMBER ( ARGS )","$$ = new yy.CallExp(@1, $1, $3)"],
      ["MEMBER EXP","$$ = new yy.CallExp(@1, [$1], $2)"],
      ["MEMBER ( )","$$ = new yy.CallExp(@1, $1)"],
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
      ["MEMBER . ID ", "$$ = new yy.MemExp(@1, $1, new yy.ID(@3,$3))"],
      "MEMBER [ ID ]",
      ["ID", "$$ = new yy.ID(@1, $1) "]
    ],
    "LITERAL":[
      ["NUM","$$ = new yy.Number(@1, yytext)"],
      ["STRING","$$ = new yy.String(@1, yytext)"]
    ]
  }
}

// export const possum = new Possum(grammar)

// function main() {
//   let jenkinsFile = "one( 5); two(7) \n "
//   let tokens = possum.tokenize(jenkinsFile)
//   console.log(tokens)

//   let output = possum.parse(jenkinsFile)
//   console.log(output)
//   // console.log('no')

//   // let p = new ASTPrinter()
//   // p.print(output)
//   let p = new Printer()
//   p.print(output)
  
// }
// main()