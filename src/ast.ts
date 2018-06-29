import { yylloc } from "jison";

// name Node already taken by javascript
export class Lode {
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

  children():Array<Lode> {
    throw new Error(`Method not implemented ${this}`)
    return null
  }
}

class NonTerminal extends Lode {
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

  children():Array<Lode> {
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
    public callee:MemExp | ID, 
    public args:Array<any> = [],
    // use empty array to allow children to concat
    public body:Block | Array<any> = []
  ) {
    super('CallExp', yylloc)
  }
  
  children():Array<Lode> {
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
  children():Array<Lode> { return [this.left, this.right] }
}

export class Stmt extends NonTerminal {
  constructor(yylloc:yylloc, public exp:any) {
    super('Stmt', yylloc)
  }
  children():Array<Lode> { return [this.exp] }
}

export class Block extends NonTerminal {
  constructor(yylloc:yylloc, public body:Array<Stmt>) {
    super('Block', yylloc)
  }
  children():Array<Lode> { return this.body }
}


// Abstract Syntax Tree Literals (or Terminals)
class Terminal extends Lode {
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
    this.printLode("", true, node)
  }

  printLode(prefix:string, isTail:boolean, node:Lode) {
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
        if (! (child instanceof Lode)) {
          throw new Error(`child ${child} not instance of Lode`)
        }
        if (child != null) {
          this.printLode(prefix + (isTail ? "    " : "│   "), false, child)
        }
      }
      this.printLode(`${prefix}${(isTail ? "    " : "│   ")}`,true,lastChild)
    } else if (node instanceof Terminal) {
      return
    } else {
      console.log(node)
      throw new Error(`unknown node type found ${node}`)
    }
  }
}

enum Symbol {
  MemExp,
  CallExp
}

export function stringToLode (symbolText:string) {

}