import * as Jison from "jison"
import JisonLex = require("jison-lex")
import * as ast from './ast'
import { ASTStatements } from "./ast";
let Parser = Jison.Parser

export class Possum {
  monitor:TokenMonitor
  grammar:Jison.grammar
  lexer:JisonLex
  parser:Jison.Parser
  constructor(grammar:Jison.grammar) {
    this.monitor = new TokenMonitor()
    // deep clone to prevent modifyingg original
    let lexGrammar:Jison.grammar = JSON.parse(JSON.stringify(grammar.lex));
    this.lexer = new JisonLex(lexGrammar)
    this.lexer.yy = ast

    this.parser = new Parser(grammar)
    this.parser.lexer.lex = this.bulidCustomLexFunc()
    this.parser.yy = ast
    this.parser.yy.monitor = this.monitor
    
    this.monitor.setUpTerminals(this.parser.terminals_)

  }

  bulidCustomLexFunc():any {
    let _this = this
    let lex = function():number {
      // r is rule number matched
      var r = this.next();
      _this.monitor.addRuleMatched(r)  
      if (r) {
        return r;
      } else {
        return this.lex();
      }
    }
    return lex
  }

  tokenize(text:string):Array<string> {
    this.monitor.reset()
    this.lexer.setInput(text)
    let tokens:Array<string> = []
    let token = this.lexer.lex()
    // iterate until no tokens left
    while(token !== 1) {
      tokens.push(token)
      token = this.lexer.lex()
    }
    return tokens
  }


  parse(text:string):any {
    this.monitor.reset()
    return this.parser.parse(text)
  }

}




// Tells parser when to inject semicolon
class TokenMonitor {
  // terminals: hashmap<number,string>
  terminals: any = []
  targetTokenNumbers: Array<string> = []
  symbols: Array<number> = []

  constructor() {}

  reset() {
    this.symbols = []
  }

  // return true if previous line number not same
  // as curLineNumber and last token was } or )
  shouldSemiColon(yylloc:Jison.yylloc) {
    //console.log('called')
    if (this.terminals === []) {
      console.log('ERROR')
      throw new Error('terminals not set')
    }
    if (yylloc.first_line === yylloc.last_line) {
      //console.log('same line')
      return false
    }
    let lastVal:number = this.symbols[this.symbols.length-1]
    if (this.targetTokenNumbers.includes(String(lastVal)))  {
      return true
    }
    return false
  }

  // pass in dictionar of terminals
  // terminals: hashmap<number,string>
  setUpTerminals(terminals:Jison.numToString) {
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

  addRuleMatched(rule:number) {
    // if not whitespace add rule
    this.symbols.push(rule)
  }
}