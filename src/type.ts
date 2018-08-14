import * as ast from './ast'
import { CallExp } from './ast';

type rules = {
  [callee:string]:{

  }
}

export class TypeChecker {
  //private scope:Array<ast.Lode> = [] 
  constructor(
    private rootNode:ast.Lode,
    private rules:rules,
  ) {
    this.rules = {
      
    }
  }

  traverse(node:ast.Lode, scope:Array<ast.Lode>) {
    scope.push(node)
    this.nodecheck(node, scope)
    for (let child of node.children()) {
      this.traverse(child, scope)
    }
  }

  nodecheck(node:ast.Lode, scope:Array<ast.Lode>) {
    if (node instanceof ast.CallExp) {
      if (node.callee instanceof ast.ID) {
        if (node.callee.text == 'pipeline') {
          let temp = []
          for (let stmt of node.stmts) {
            let callExp = stmt as CallExp
            // temp.push(callExp.callee.text)
          }
        }
      }
    }
  }

  nodecheck2(node:ast.Lode, scope: Array<ast.Lode>) {
    // check node is function and id only
    if (node instanceof ast.CallExp) {
      if (node.callee instanceof ast.ID) {
        // if exist in rules, then expect stmts
        if (node.callee.text in this.rules) {
          let ids = []
          for (let stmt of node.stmts) {
            let callExp:ast.StrictCallExp = this.castPipelineCallExp(stmt)
            if (callExp != null) {
              ids.push(callExp.callee.text)
            }
          }
        }
      }
    }
  }

  castPipelineCallExp(node:ast.Lode):ast.StrictCallExp | undefined {
    if (
      (node instanceof ast.CallExp) &&
      (node.callee instanceof ast.ID) 
    ) {
      let temp:any = node
      return temp as ast.StrictCallExp
    }
  }


}