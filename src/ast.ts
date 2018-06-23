class ASTNode {
  // symbol is type of terminal
  symbol: string
  line: number
  column: number

  constructor(symbol:string, yylloc:any) {
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
  constructor(symbol:string, yylloc:any, yytext:string) {
    super(symbol,  yylloc)
    this.text = yytext
  }

  toString():string {
    return `<${this.symbol}> ${this.text} line:${this.line} col:${this.column}`
  }
}

export class ASTNumber extends ASTLiteral {
  constructor( yylloc, yytext) {
    super('NUM', yylloc, yytext)
  }
}

export class ASTString extends ASTLiteral {
  constructor( yylloc, yytext) {
    super('STRING',yylloc, yytext)
  }
}

// Abstract Syntax tree 
export class ASTBranch extends ASTNode {

  nodes:Array<ASTNode> = []

  constructor(symbol:string, yylloc:any) {
    super(symbol, yylloc)
  }
}
export class ASTExp extends ASTNode {
  node:ASTNode
  constructor(yylloc:any, node:ASTNode) {
    super('EXP',yylloc)
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
  callerNode:any
  constructor(yylloc, callerNode, argNode) {
    super('FUNC_EXP', yylloc)
    if (argNode !== undefined) {
      this.argNode = argNode
    } else {
      this.argNode = null
    }
  }
}

export class ASTStatement extends ASTNode {
  node:any
  constructor(yyloc:any, node:any) {
    super('STATEMENT', yyloc)
  }
}

// holds either both statements and statement
//              OR just statement
export class ASTStatements extends ASTNode {
  // statements is optional
  statement:ASTStatement
  statements:ASTStatements
  constructor(yyloc, statement:ASTStatement, statements:ASTStatements) {
    super('STATEMENTS',yyloc)
    if (statements !== undefined) {
      this.statements = statements
    } else {
      this.statements = null
    }
  }
}


class ASTPrinter {
  visit(node, action) {
    switch(node.symbol) {
      case 'STATEMENTS': {
        action(node)
      }
    }
  }
}