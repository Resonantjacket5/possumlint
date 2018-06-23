declare module 'jison-lex' {

  class JisonLex {
    yy:any
    lexus:Function
    constructor(text:string) 
  }
  export = JisonLex
}
// TODO: clean up or reafactor to use it
// export { Lexer as JisonLex } from 'jison'
// import { Lexer } from 'jison'
// export = JisonLex
//export let Lexer = require('jison').Lexer
// export { Lexer as JisonLex } from 'jison'

// declare module 'jison' {
//   export class Parser {
//     yy:any
//     productions: Array<typal_constructor>
//     lexer:Lexer

//     constructor(grammar:any)
//   }