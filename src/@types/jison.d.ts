declare module 'jison' {
  export class Parser {
    yy:any
    productions: Array<typal_constructor>
    lexer:Lexer
    symbols_: {[symbol:string]: number}
    terminals_: {[terminalNumber:number]:string}
    productions_: Array<[number,number]>

    constructor(grammar:any)

    // anonymous function
    performAction: Function

    // Returns result from the goal statement
    parse(text:string):any
  }

  type typal_constructor = {
    symbol:string
    handle:Array<any>
    nullable:boolean
    id: number 
    first: Array<any>
    precedence:number
  }

  type grammar = {
    // [top:string]: {

    // }
    "lex":{
    //   'macros':any
    //   'startConditions':any
    //   'rules':any
    }
    /* 
      bnf type expects 
      SYMBOL: [
        "MATCH",
        "["MATCH","$$ = new Exp();"],
      ]
    */
    "bnf":{
      [symbol:string]:
      Array<
        Array<string> | string
      >
    }
  }

  export class Lexer {
    parseError: Function
    setInput: Function // accepts string
    // input: [Function: input],
    // unput: [Function: unput],
    // more: [Function: more],
    // reject: [Function: reject],
    // less: [Function: less],
    // pastInput: [Function: pastInput],
    // upcomingInput: [Function: upcomingInput],
    // showPosition: [Function: showPosition],
    // test_match: [Function: test_match],
    // next: [Function: next],
    lex ():number;
    // begin: [Function: begin],
    // popState: [Function: popState],
    // _currentRules: [Function: _currentRules],
    // topState: [Function: topState],
    // pushState: [Function: pushState],
    // stateStackSize: [Function: stateStackSize],
    // options: {},
    // performAction: [Function: anonymous],
    // rules:Array<any> //actually array of regex
    // conditions: { COMMENT: [Object], MULTI_COMMENT: [Object], INITIAL: [Object] },
    // yy: {},
    // generate: [Function],
    // generateModule: [Function],
    // generateCommonJSModule: [Function],
    // generateAMDModule: [Function]
    constructor()
  }
}