import * as ast from './ast'

type rule = {
  [symbol:string]:{

  }
}

class TypeChecker {

  constructor(
    private rootNode:ast.Lode,
    private rules:Array<rule>
  ) {

  }

  traverse(node:ast.Lode) {
    for (let child of node.children()) {
      this.nodecheck(child)
    }
  }

  nodecheck(node:ast.Lode) {
    if (node instanceof ast.CallExp) {
      if (node.callee instanceof ast.ID) {
        node.callee.text
      }
    }
  }
}