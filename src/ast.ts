import { yylloc } from "jison";

interface Node {
  // contains either more children or empty dictionary
  children: {
    [symbol:string]: Node
  } | {}
}

class ASTNode {
  // symbol is type of terminal
  symbol: string
  line: number
  column: number
  constructor(symbol:string, yylloc:yylloc) {
    this.symbol = symbol
    this.line = yylloc.first_line
    this.column = yylloc.first_column
  }

  toString():string {
    return `<${this.symbol}> line:${this.line} col:${this.column}`
  }

  children():Array<ASTNode> {
    throw new Error('Method not implemented')
    return null
  }
}

// Trial 2 nodes

export class MemExp extends ASTNode {
  constructor(
    yylloc:yylloc, 
    public obj:any, 
    public prop:any
  ) {
    super('MemExp', yylloc)
  }

  children():Array<ASTNode> {
    return [this.obj, this.prop]
  }
}

// There are 4 types of CallExp
// 1) clock() no args
// 2) clock('one') w/ args
// 3) clock{ show() } w/ body 
// 4) clock('weird') { really? } both args and body
export class CallExp extends ASTNode {
  constructor(
    yylloc:yylloc, 
    public callee:number, 
    public args:Array<any> = [],
    public body?:Block
  ) {
    super('CallExp', yylloc)
  }
  
  children():Array<ASTNode> {
    return []
    .concat(this.callee)
    .concat(this.args)
    .concat(this.body)
  }
}

export class AssignExp extends ASTNode {
  operator = '='
  constructor(yylloc:yylloc, public left:any, public right:any) {
    super('AssignExp', yylloc)
  }
}

export class Stmt extends ASTNode {
  constructor(yylloc:yylloc, public exp:any) {
    super('Stmt', yylloc)
  }
}

export class Block extends ASTNode {
  constructor(yylloc:yylloc, public body:Array<Stmt>) {
    super('Block', yylloc)
  }
}


// Abstract Syntax Tree Literals (or Terminals)
class ASTLiteral extends ASTNode {
  text: string
  constructor(symbol:string, yylloc:yylloc, yytext:string) {
    super(symbol, yylloc)
    this.text = yytext
  }

  toString():string {
    return `<${this.symbol}> ${this.text} line:${this.line} col:${this.column}`
  }
}

export class ASTNumber extends ASTLiteral {
  constructor(yylloc:any, yytext:string) {
    super('NUM', yylloc, yytext)
  }
}

export class ASTString extends ASTLiteral {
  constructor(yylloc:any, yytext:string) {
    super('STRING', yylloc, yytext)
  }
}

export class ASTID extends ASTLiteral {
  constructor(yylloc:any, yytext:string) {
    super('ID', yylloc, yytext)
  }
}


// export class ASTClosureExp2 extends ASTBranch {
//   callee: any
//   params: Array<any>
//   stmts: ASTStatements
//   constructor(yylloc:any, caller:any, stmts:ASTStatements, params:any) {
//     super('CLOS_EXP', yylloc)
//     this.callee = caller
//     this.children.stmts = stmts
//     if (params !== undefined) {
//       this.children.params = params
//     }
//   }
// }
// export class ASTStatements2 extends ASTBranch {
//   // TODO: better word
//   stmtList: Array<ASTStatement>
//   constructor(yyloc:any, statement:ASTStatement, statements:ASTStatements) {
//     super('STATEMENTS',yyloc)
//   }
// }

class ASTManager {
  // holds current root stmt to watch
  stmts:Array<ASTStatements> = []
  constructor(yy:any) {
    // setup ast to access ast manager
    yy.m = this
  }

  // Add one 'statements'
  addStmts(node:ASTStatements) {
    this.stmts.push(node)
    return node
  }

  

}


export class ASTPrinter {
  constructor() {}

  print(node:any) {
    this.printNode("", true, node)
  }

  printNode(prefix:string, isTail:boolean, node:any) {
    console.log(`${prefix}${(isTail ? "└── " : "├── ")}${node.toString()}`)
    for (let child in node.children) {
      let curNode = node.children[child]
      if (curNode === undefined || curNode === null) {
        throw new Error(`${curNode} doesnt exit in ${node.children}`)
      }
      this.printNode(prefix + (isTail ? "    " : "│   "), false, curNode)
    }
    // if (
    //   (node.children !== null) &&
    //   (node.children !== undefined)
    // )
    // if (Object.keys(node.children).length > 0) {
    //   console.log(`${prefix}${(isTail ? "    " : "│   ")}`)
    // }
  }
}