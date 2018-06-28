import { yylloc } from "jison";

interface Node {
  // contains either more children or empty dictionary
  children: {
    [symbol:string]: Node
  } | {}
}

class ASTNode {
  // symbol is type of terminal
  line: number
  column: number
  constructor(public symbol:string, yylloc:yylloc) {
    this.line = yylloc.first_line
    this.column = yylloc.first_column
  }

  toString():string {
    return `<${this.symbol}> Ln:${this.line} Col:${this.column}`
  }

  children():Array<ASTNode> {
    throw new Error('Method not implemented')
    return null
  }
}

class NonTerminal extends ASTNode {
  constructor(symbol:string, yylloc:yylloc) {
    super(symbol, yylloc)
  }
}

export class MemExp extends NonTerminal {
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
export class CallExp extends NonTerminal {
  constructor(
    yylloc:yylloc, 
    public callee:number, 
    public args:Array<any> = [],
    // use empty array to allow children to concat
    public body:Block | Array<any> = []
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

export class AssignExp extends NonTerminal {
  operator = '='
  constructor(yylloc:yylloc, public left:any, public right:any) {
    super('AssignExp', yylloc)
  }
}

export class Stmt extends NonTerminal {
  constructor(yylloc:yylloc, public exp:any) {
    super('Stmt', yylloc)
  }
  children():Array<ASTNode> { return [this.exp] }
}

export class Block extends NonTerminal {
  constructor(yylloc:yylloc, public body:Array<Stmt>) {
    super('Block', yylloc)
  }
  children():Array<ASTNode> { return this.body }
}


// Abstract Syntax Tree Literals (or Terminals)
class Terminal extends ASTNode {
  text: string
  constructor(symbol:string, yylloc:yylloc, yytext:string) {
    super(symbol, yylloc)
    this.text = yytext
  }

  toString():string {
    return `<${this.symbol}> ${this.text} Ln:${this.line} Col:${this.column}`
  }

  children():Array<any> {
    throw new Error('Method should not be called on Terminal')
    return []
  }
}

export class Number extends Terminal {
  constructor(yylloc:any, yytext:string) {
    super('NUM', yylloc, yytext)
  }
}

export class String extends Terminal {
  constructor(yylloc:any, yytext:string) {
    super('STRING', yylloc, yytext)
  }
}

export class ID extends Terminal {
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

export class Printer {
  constructor(
    private stream:boolean = false
  ) {}

  print(node:any) {
    this.printNode("", true, node)
  }

  printNode(prefix:string, isTail:boolean, node:any) {

    console.log(`${prefix}${(isTail ? "└── " : "├── ")}${node.toString()}`)
    if (node instanceof NonTerminal) {
      let children = node.children()
      let lastChild = children.pop()
      for (let child of node.children()) {
        // this guard shouldn't exist
        if (! (child instanceof ASTNode)) {
          throw new Error(`child ${child} not instance of ASTNode`)
        }
        if (child != null) {
          this.printNode(prefix + (isTail ? "    " : "│   "), false, child)
        }
      }
      this.printNode(`${prefix}${(isTail ? "    " : "│   ")}`,true,lastChild)
    } else if (node instanceof Terminal) {
      return
    } else {
      throw new Error('unknown node type found')
    }
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