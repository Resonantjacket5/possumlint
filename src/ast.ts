import { yylloc } from "jison";

class Node {
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

  children():Array<Node> {
    throw new Error(`Method not implemented ${this}`)
    return null
  }
}

class NonTerminal extends Node {
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

  children():Array<Node> {
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
  
  children():Array<Node> {
    return []
    .concat(this.callee)
    .concat(this.args)
    .concat(this.body)
  }
}

export class AssignExp extends NonTerminal {
  operator = '='
  constructor(
    yylloc:yylloc, 
    public left:any, 
    public right:any
  ) {
    super('AssignExp', yylloc)
  }
  children():Array<Node> { return [this.left, this.right] }
}

export class Stmt extends NonTerminal {
  constructor(yylloc:yylloc, public exp:any) {
    super('Stmt', yylloc)
  }
  children():Array<Node> { return [this.exp] }
}

export class Block extends NonTerminal {
  constructor(yylloc:yylloc, public body:Array<Stmt>) {
    super('Block', yylloc)
  }
  children():Array<Node> { return this.body }
}


// Abstract Syntax Tree Literals (or Terminals)
class Terminal extends Node {
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

export class Printer {
  constructor(
    private stream:boolean = false
  ) {}

  print(node:any) {
    this.printNode("", true, node)
  }

  printNode(prefix:string, isTail:boolean, node:Node) {
    console.log(`${prefix}${(isTail ? "└── " : "├── ")}${node.toString()}`)
    if (node instanceof NonTerminal) {
      let children = node.children()
      let lastChild = children.pop()
      // if (node instanceof Stmt) {
      //   console.log('children',children)
      //   console.log('last child',lastChild) 
      // }
      
      for (let child of children) {
        // this guard shouldn't exist
        if (! (child instanceof Node)) {
          throw new Error(`child ${child} not instance of Node`)
        }
        if (child != null) {
          this.printNode(prefix + (isTail ? "    " : "│   "), false, child)
        }
      }
      this.printNode(`${prefix}${(isTail ? "    " : "│   ")}`,true,lastChild)
    } else if (node instanceof Terminal) {
      return
    } else {
      console.log(node)
      throw new Error(`unknown node type found ${node}`)
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