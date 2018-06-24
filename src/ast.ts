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
  children: {
    [symbol:string]: Node
  } | {} = {}
  constructor(symbol:string, yylloc:yylloc) {
    this.symbol = symbol
    this.line = yylloc.first_line
    this.column = yylloc.first_column
  }

  toString():string {
    return `<${this.symbol}> line:${this.line} col:${this.column}`
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
    super('STRING',yylloc, yytext)
  }
}

// Abstract Syntax tree 
export class ASTBranch extends ASTNode {
  // initialize children
  children = {}
  constructor(symbol:string, yylloc:any) {
    super(symbol, yylloc)
  }
}
export class ASTExp extends ASTBranch {
  children:{
    'EXP': any
  }
  constructor(yylloc:any, node:any) {
    super('EXP',yylloc)
    this.children.EXP = node
  }
}

export class ASTAssignExp extends ASTBranch {
  left:any
  right:any

  constructor(yylloc:any, left:any, right:any) {
    super('ASSIGN_EXP',yylloc)
  }
}

export class ASTFuncExp extends ASTNode {
  children: {
    caller: ASTExp,
    paramNode: any
  }
  constructor(yylloc:any, callerNode:any, paramNode:any) {
    super('FUNC_EXP', yylloc)
    if (paramNode !== undefined) {
      this.children.paramNode = paramNode
    }
  }

}

export class ASTStatement extends ASTBranch {
  children: {
    EXP: ASTExp
  } = { EXP: null }
  constructor(yyloc:any, exp:ASTExp) {
    super('STATEMENT', yyloc)
    this.children.EXP = exp
  }
}

// holds either both statements and statement
//              OR just statement
export class ASTStatements extends ASTBranch {
  children: {
    stmt: ASTStatement
    stmts: ASTStatements
  }
  constructor(yyloc:any, statement:ASTStatement, statements:ASTStatements) {
    super('STATEMENTS',yyloc)
    this.children.stmt = statement
    if (statements !== undefined) {
      this.children.stmts = statements
    }
  }
}


export class ASTPrinter {
  constructor() {}
  // visit(node:ASTNode, action:Function) {
    
  // }


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